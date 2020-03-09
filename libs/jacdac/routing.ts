/*
services from jacdac-v0

debugging services?
name service - need to re-implement
identification service - led blinking

*/

namespace jacdac {
    const devNameSettingPrefix = "#jddev:"

    let hostServices: Host[]
    let unattachedClients: Client[]
    let myDevice: Device
    //% whenUsed
    let devices_: Device[] = []
    //% whenUsed
    let announceCallbacks: (() => void)[] = [];

    //% fixedInstances
    export class Host {
        protected supressLog: boolean;
        running: boolean
        serviceNumber: number

        handlePacketOuter(pkt: JDPacket) {
            if (pkt.service_command == CMD_GET_ADVERTISEMENT_DATA) {
                this.sendReport(
                    JDPacket.from(REP_ADVERTISEMENT_DATA, 0, this.advertisementData()))
            } else {
                this.handlePacket(pkt)
            }
        }

        handlePacket(pkt: JDPacket) { }

        isConnected() {
            return this.running
        }

        advertisementData() {
            return Buffer.create(0)
        }

        sendReport(pkt: JDPacket) {
            pkt.service_number = this.serviceNumber
            pkt._send(myDevice)
        }

        constructor(
            public name: string,
            public serviceClass: number
        ) { }

        /**
         * Registers and starts the driver
         */
        //% blockId=jacdachoststart block="start %service"
        //% group="Services" blockGap=8
        start() {
            if (this.running)
                return
            this.running = true
            jacdac.start();
            this.serviceNumber = hostServices.length
            hostServices.push(this)
            this.log("start");
        }

        /**
         * Unregister and stops the driver
         */
        //% blockId=jacdachoststop block="stop %service"
        //% group="Services" blockGap=8
        stop() {
            if (!this.running)
                return
            this.running = false
            this.log("stop")
        }

        protected log(text: string) {
            if (!this.supressLog || jacdac.consolePriority < console.minPriority) {
                let dev = selfDevice().toString()
                console.add(jacdac.consolePriority, `${dev}:${this.serviceClass}>${this.name}>${text}`);
            }
        }
    }

    //% fixedInstances
    export class Client {
        requiredDeviceName: string
        device: Device
        currentDevice: Device
        eventId: number
        broadcast: boolean // when true, this.device is never set
        serviceNumber: number;
        protected supressLog: boolean;
        started: boolean;
        advertisementData: Buffer

        constructor(
            public name: string,
            public serviceClass: number
        ) {
            this.eventId = control.allocateNotifyEvent();
        }

        broadcastDevices() {
            return devices().filter(d => d.clients.indexOf(this) >= 0)
        }

        isConnected() {
            return !!this.device
        }

        requestAdvertisementData() {
            this.sendCommand(JDPacket.onlyHeader(CMD_GET_ADVERTISEMENT_DATA, 0))
        }

        handlePacketOuter(pkt: JDPacket) {
            if (pkt.service_command == REP_ADVERTISEMENT_DATA && pkt.service_argument == 0)
                this.advertisementData = pkt.data
            else
                this.handlePacket(pkt)
        }

        handlePacket(pkt: JDPacket) { }

        _attach(dev: Device) {
            if (this.device) throw "Oops"
            if (!this.broadcast) {
                if (this.requiredDeviceName && this.requiredDeviceName != dev.name)
                    return false // don't attach
                this.device = dev
            }
            dev.clients.push(this)
            this.onAttach()
            return true
        }

        _detach() {
            if (!this.broadcast) {
                if (!this.device) throw "Oops"
                this.device = null
                unattachedClients.push(this)
            }
            this.onDetach()
        }

        protected onAttach() { }
        protected onDetach() { }

        sendCommand(pkt: JDPacket) {
            pkt.service_number = this.serviceNumber
            pkt._send(this.device)
        }

        sendPackedCommand(service_command: number, service_argument: number, fmt: string, nums: number[]) {
            const pkt = JDPacket.packed(service_command, service_argument, fmt, nums)
            this.sendCommand(pkt)
        }

        protected registerEvent(value: number, handler: () => void) {
            control.onEvent(this.eventId, value, handler);
        }

        protected log(text: string) {
            if (!this.supressLog || jacdac.consolePriority < console.minPriority) {
                let dev = selfDevice().toString()
                let other = this.device ? this.device.toString() : "<unbound>"
                console.add(jacdac.consolePriority, `${dev}/${other}:${this.serviceClass}>${this.name}>${text}`);
            }
        }

        start() {
            if (this.started) return
            this.started = true
            jacdac.start()
            unattachedClients.push(this)
        }
    }

    export class Device {
        services: Buffer
        lastSeen: number
        clients: Client[] = []

        constructor(public deviceId: string) { }

        get name() {
            return settings.readString(devNameSettingPrefix + this.deviceId)
        }

        set name(n: string) {
            settings.writeString(devNameSettingPrefix + this.deviceId, n)
        }

        toString() {
            return this.name || this.deviceId
        }
    }

    //% whenUsed
    export let onIdentifyRequest = () => {
        const led = pins.pinByCfg(DAL.CFG_PIN_LED);
        if (!led)
            return
        for (let i = 0; i < 10; ++i) {
            led.digitalWrite(true)
            pause(100)
            led.digitalWrite(false)
            pause(100)
        }
    }

    class ControlService extends Host {
        constructor() {
            super("ctrl", 0)
        }
        handlePacketOuter(pkt: JDPacket) {
            switch (pkt.service_command) {
                case CMD_GET_ADVERTISEMENT_DATA:
                    queueAnnounce()
                    break
                case CMD_CTRL_IDENTIFY:
                    control.runInBackground(onIdentifyRequest)
                    break
            }
        }
    }
    export function devices() {
        return devices_.slice()
    }

    export function selfDevice() {
        if (!myDevice)
            myDevice = new Device(control.deviceLongSerialNumber().toHex())
        return myDevice
    }

    export function onAnnounce(cb: () => void) {
        announceCallbacks.push(cb)
    }

    function queueAnnounce() {
        const fmt = "<" + hostServices.length + "I"
        const ids = hostServices.map(h => h.running ? h.serviceClass : -1)
        JDPacket.packed(REP_ADVERTISEMENT_DATA, 0, fmt, ids)
            ._send(selfDevice())
        announceCallbacks.forEach(f => f())
        gcDevices()
    }

    function reattach(dev: Device) {
        const newClients: Client[] = []
        const occupied = Buffer.create(dev.services.length >> 2)
        for (let c of dev.clients) {
            if (c.broadcast) {
                c._detach()
                continue // will re-attach
            }
            const newClass = dev.services.getNumber(NumberFormat.UInt32LE, c.serviceNumber << 2)
            if (newClass == c.serviceClass) {
                newClients.push(c)
                occupied[c.serviceNumber] = 1
            } else {
                c._detach()
            }
        }
        dev.clients = newClients

        if (unattachedClients.length == 0)
            return

        for (let i = 0; i < dev.services.length; i += 4) {
            if (occupied[i >> 2])
                continue
            const service_class = dev.services.getNumber(NumberFormat.UInt32LE, i)
            for (let cc of unattachedClients) {
                if (cc.serviceClass == service_class) {
                    if (cc._attach(dev)) {
                        cc.serviceNumber = i >> 2
                        break
                    }
                }
            }
        }
    }

    export function routePacket(pkt: JDPacket) {
        const devId = pkt.device_identifier
        const multiCommandClass = pkt.multicommand_class
        if (multiCommandClass) {
            if (!pkt.is_command)
                return // only bcast commands supported
            const h = hostServices.find(s => s.serviceClass == multiCommandClass);
            if (h && h.running) {
                // pretend it's directly addressed to us
                pkt.device_identifier = selfDevice().deviceId
                h.handlePacketOuter(pkt)
            }
        } else if (devId == selfDevice().deviceId) {
            if (!pkt.is_command)
                return // huh? someone's pretending to be us?
            const h = hostServices[pkt.service_number]
            if (h && h.running) h.handlePacketOuter(pkt)
        } else {
            if (pkt.is_command)
                return // it's a command, and it's not for us

            let dev = devices_.find(d => d.deviceId == devId)

            if (pkt.service_number == 0) {
                if (pkt.service_command == REP_ADVERTISEMENT_DATA) {
                    if (!dev)
                        dev = new Device(pkt.device_identifier)
                    if (!pkt.data.equals(dev.services)) {
                        dev.services = pkt.data
                        dev.lastSeen = control.millis()
                        reattach(dev)
                    }
                } else if (pkt.service_command == REP_ACK) {
                    _gotAckFor(pkt)
                }
                if (dev)
                    dev.lastSeen = control.millis()
                return
            }

            if (!dev)
                // we can't know the service_class, no announcement seen yet for this device
                return

            dev.lastSeen = control.millis()

            const service_class = dev.services.getNumber(NumberFormat.UInt32LE, pkt.service_number << 2)
            if (!service_class || service_class == 0xffffffff)
                return

            const client = dev.clients.find(c =>
                c.broadcast
                    ? c.serviceClass == service_class
                    : c.serviceNumber == pkt.service_number)
            if (client) {
                client.currentDevice = dev
                client.handlePacketOuter(pkt)
            }
        }
    }

    function gcDevices() {
        const cutoff = control.millis() - 2000
        for (let i = 0; i < devices_.length; ++i) {
            const dev = devices_[i]
            if (dev.lastSeen < cutoff) {
                devices_.splice(i, 1)
                i--
                for (let c of dev.clients) {
                    c._detach()
                }
                dev.clients = null
            }
        }
    }

    export function start(): void {
        if (jacdac.__physIsRunning())
            return

        hostServices = [new ControlService()]
        unattachedClients = []
        jacdac.__physStart();
        control.internalOnEvent(jacdac.__physId(), DAL.JD_SERIAL_EVT_DATA_READY, () => {
            let buf: Buffer;
            while (null != (buf = jacdac.__physGetPacket())) {
                routePacket(new JDPacket(buf))
            }
        });
        control.internalOnEvent(jacdac.__physId(), 100, queueAnnounce);

        console.addListener(function (pri, msg) {
            if (msg[0] != ":")
                consoleHost.add(pri as number as JDConsolePriority, msg)
        });
        consoleHost.start()
    }

    export function diagnostics(): jacdac.JDDiagnostics {
        return new jacdac.JDDiagnostics(jacdac.__physGetDiagnostics());
    }

    export function stop() {
        jacdac.__physStop(); // not really implemented
    }

    export class JDDiagnostics {
        bus_state: number;
        bus_lo_error: number;
        bus_uart_error: number;
        bus_timeout_error: number;
        packets_sent: number;
        packets_received: number;
        packets_dropped: number;

        constructor(buf: Buffer) {
            if (!buf) return;

            [
                this.bus_state,
                this.bus_lo_error,
                this.bus_uart_error,
                this.bus_timeout_error,
                this.packets_sent,
                this.packets_received,
                this.packets_dropped
            ] = pins.unpackBuffer("7I", buf)
        }
    }
}
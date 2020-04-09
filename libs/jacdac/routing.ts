/*
services from jacdac-v0

debugging services?
name service - need to re-implement
identification service - led blinking

*/

namespace jacdac {
    export const devNameSettingPrefix = "#jddev:"

    let hostServices: Host[]
    export let _unattachedClients: Client[]
    export let _allClients: Client[]
    let myDevice: Device
    //% whenUsed
    let devices_: Device[] = []
    //% whenUsed
    let announceCallbacks: (() => void)[] = [];
    let newDeviceCallbacks: (() => void)[];

    function log(msg: string) {
        console.add(jacdac.consolePriority, msg);
    }

    //% fixedInstances
    export class Host {
        protected supressLog: boolean;
        running: boolean
        serviceNumber: number
        stateUpdated: boolean

        handlePacketOuter(pkt: JDPacket) {
            if (pkt.service_command == CMD_ADVERTISEMENT_DATA) {
                this.sendReport(
                    JDPacket.from(CMD_ADVERTISEMENT_DATA, this.advertisementData()))
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
            pkt._sendReport(myDevice)
        }

        private sendOneChunk(cmd: number, bufs: Buffer[], currno: number, total: number) {
            if (cmd != null) {
                bufs.unshift(Buffer.pack("HH", [currno, total]))
                this.sendReport(JDPacket.from(cmd, Buffer.concat(bufs)))
            }
        }

        private sendChunkedReportCore(cmd: number, bufs: Buffer[], total: number) {
            let sz = 0
            let prev = 0
            let i = 0
            let currno = 0
            for (i = 0; i < bufs.length; ++i) {
                if (sz + bufs[i].length > JD_SERIAL_MAX_PAYLOAD_SIZE - 4) {
                    this.sendOneChunk(cmd, bufs.slice(prev, i), currno, total)
                    currno++
                    prev = i
                    sz = 0
                }
                sz += bufs[i].length
            }
            if (prev != i) {
                this.sendOneChunk(cmd, bufs.slice(prev, i), currno, total)
                currno++
            }
            return currno
        }

        sendChunkedReport(cmd: number, bufs: Buffer[]) {
            const total = this.sendChunkedReportCore(null, bufs, 0)
            this.sendChunkedReportCore(cmd, bufs, total)
        }

        handleRegBool(pkt: JDPacket, register: number, current: boolean): boolean {
            return this.handleRegInt(pkt, register, current ? 1 : 0) != 0
        }

        handleRegInt(pkt: JDPacket, register: number, current: number): number {
            const getset = pkt.service_command >> 12
            if (getset == 0 || getset > 2)
                return current
            const reg = pkt.service_command & 0xfff
            if (reg != register)
                return current
            if (!current)
                current = 0 // make sure there's no null/undefined
            if (getset == 1) {
                this.sendReport(JDPacket.packed(pkt.service_command, "i", [current >> 0]))
            } else {
                const v = pkt.intData
                if (v != current) {
                    this.stateUpdated = true
                    current = v
                }
            }
            return current
        }

        handleRegBuffer(pkt: JDPacket, register: number, current: Buffer): Buffer {
            const getset = pkt.service_command >> 12
            if (getset == 0 || getset > 2)
                return current
            const reg = pkt.service_command & 0xfff
            if (reg != register)
                return current

            if (getset == 1) {
                this.sendReport(JDPacket.from(pkt.service_command, current))
            } else {
                let data = pkt.data
                const diff = current.length - data.length
                if (diff == 0) { }
                else if (diff < 0)
                    data = data.slice(0, current.length)
                else
                    data = data.concat(Buffer.create(diff))

                if (!data.equals(current)) {
                    current.write(0, data)
                    this.stateUpdated = true
                }

            }
            return current
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
            if (this.supressLog || jacdac.consolePriority < console.minPriority)
                return
            let dev = selfDevice().toString()
            console.add(jacdac.consolePriority, `${dev}:${this.serviceClass}>${this.name}>${text}`);
        }
    }

    export class ClientPacketQueue {
        private pkts: Buffer[] = []

        constructor(public parent: Client) { }

        private updateQueue(pkt: JDPacket) {
            const cmd = pkt.service_command
            for (let i = 0; i < this.pkts.length; ++i) {
                if (this.pkts[i].getNumber(NumberFormat.UInt16LE, 2) == cmd) {
                    this.pkts[i] = pkt.withFrameStripped()
                    return
                }
            }
            this.pkts.push(pkt.withFrameStripped())
        }

        clear() {
            this.pkts = []
        }

        send(pkt: JDPacket) {
            if (pkt.is_reg_set || this.parent.serviceNumber == null)
                this.updateQueue(pkt)
            this.parent.sendCommand(pkt)
        }

        resend() {
            const sn = this.parent.serviceNumber
            if (sn == null || this.pkts.length == 0)
                return
            let hasNonSet = false
            for (let p of this.pkts) {
                p[1] = sn
                if ((p[3] >> 4) != (CMD_SET_REG >> 12))
                    hasNonSet = true
            }
            const pkt = JDPacket.onlyHeader(0)
            pkt.compress(this.pkts)
            this.parent.sendCommand(pkt)
            // after re-sending only leave set_reg packets
            if (hasNonSet)
                this.pkts = this.pkts.filter(p => (p[3] >> 4) == (CMD_SET_REG >> 12))
        }
    }

    //% fixedInstances
    export class Client {
        device: Device
        currentDevice: Device
        eventId: number
        broadcast: boolean // when true, this.device is never set
        serviceNumber: number;
        protected supressLog: boolean;
        started: boolean;
        advertisementData: Buffer

        config: ClientPacketQueue

        constructor(
            public name: string,
            public serviceClass: number,
            public requiredDeviceName: string
        ) {
            this.eventId = control.allocateNotifyEvent();
            this.config = new ClientPacketQueue(this)
        }

        broadcastDevices() {
            return devices().filter(d => d.clients.indexOf(this) >= 0)
        }

        isConnected() {
            return !!this.device
        }

        requestAdvertisementData() {
            this.sendCommand(JDPacket.onlyHeader(CMD_ADVERTISEMENT_DATA))
        }

        handlePacketOuter(pkt: JDPacket) {
            if (pkt.service_command == CMD_ADVERTISEMENT_DATA)
                this.advertisementData = pkt.data
            else
                this.handlePacket(pkt)
        }

        handlePacket(pkt: JDPacket) { }

        _attach(dev: Device, serviceNum: number) {
            if (this.device) throw "Invalid attach"
            if (!this.broadcast) {
                if (this.requiredDeviceName && this.requiredDeviceName != dev.name && this.requiredDeviceName != dev.deviceId)
                    return false // don't attach
                this.device = dev
                this.serviceNumber = serviceNum
                _unattachedClients.removeElement(this)
            }
            log(`attached ${dev.toString()}/${serviceNum} to client ${this.name}`)
            dev.clients.push(this)
            this.onAttach()
            this.config.resend()
            return true
        }

        _detach() {
            log(`dettached ${this.name}`)
            this.serviceNumber = null
            if (!this.broadcast) {
                if (!this.device) throw "Invalid detach"
                this.device = null
                _unattachedClients.push(this)
                clearAttachCache()
            }
            this.onDetach()
        }

        protected onAttach() { }
        protected onDetach() { }

        sendCommand(pkt: JDPacket, ack = false) {
            this.start()
            if (this.serviceNumber == null)
                return
            pkt.service_number = this.serviceNumber
            if (ack) {
                if (!pkt._sendWithAck(this.device))
                    throw "No ACK"
            } else
                pkt._sendCmd(this.device)
        }

        sendPackedCommand(service_command: number, fmt: string, nums: number[]) {
            const pkt = JDPacket.packed(service_command, fmt, nums)
            this.sendCommand(pkt)
        }

        // this will be re-sent on (re)attach
        setRegInt(reg: number, value: number) {
            this.start()
            this.config.send(JDPacket.packed(CMD_SET_REG | reg, "i", [value]))
        }

        setRegBuffer(reg: number, value: Buffer) {
            this.start()
            this.config.send(JDPacket.from(CMD_SET_REG | reg, value))
        }

        protected registerEvent(value: number, handler: () => void) {
            this.start()
            control.onEvent(this.eventId, value, handler);
        }

        protected log(text: string) {
            if (this.supressLog || jacdac.consolePriority < console.minPriority)
                return
            let dev = selfDevice().toString()
            let other = this.device ? this.device.toString() : "<unbound>"
            console.add(jacdac.consolePriority, `${dev}/${other}:${this.serviceClass}>${this.name}>${text}`);
        }

        start() {
            if (this.started) return
            this.started = true
            jacdac.start()
            _unattachedClients.push(this)
            _allClients.push(this)
            clearAttachCache()
        }
    }

    // 4 letter ID; 0.04%/0.01%/0.002% collision probability among 20/10/5 devices
    // 3 letter ID; 1.1%/2.6%/0.05%
    // 2 letter ID; 25%/6.4%/1.5%
    export function shortDeviceId(devid: string) {
        const h = Buffer.fromHex(devid).hash(30)
        return String.fromCharCode(0x41 + h % 26) +
            String.fromCharCode(0x41 + Math.idiv(h, 26) % 26) +
            String.fromCharCode(0x41 + Math.idiv(h, 26 * 26) % 26) +
            String.fromCharCode(0x41 + Math.idiv(h, 26 * 26 * 26) % 26)
    }

    export class Device {
        services: Buffer
        lastSeen: number
        clients: Client[] = []
        private _name: string
        private _shortId: string

        constructor(public deviceId: string) {
            devices_.push(this)
        }

        get name() {
            // TODO measure if caching is worth it
            if (this._name === undefined)
                this._name = settings.readString(devNameSettingPrefix + this.deviceId) || null
            return this._name
        }

        get shortId() {
            // TODO measure if caching is worth it
            if (!this._shortId)
                this._shortId = shortDeviceId(this.deviceId)
            return this._shortId;
        }

        toString() {
            return this.shortId + (this.name ? ` (${this.name})` : ``)
        }

        hasService(service_class: number) {
            for (let i = 4; i < this.services.length; i += 4)
                if (this.services.getNumber(NumberFormat.UInt32LE, i) == service_class)
                    return true
            return false
        }

        sendCtrlCommand(cmd: number, payload: Buffer = null) {
            const pkt = !payload ? JDPacket.onlyHeader(cmd) : JDPacket.from(cmd, payload)
            pkt.service_number = JD_SERVICE_NUMBER_CTRL
            pkt._sendCmd(this)
        }

        static clearNameCache() {
            for (let d of devices_)
                d._name = undefined
            clearAttachCache()
        }
    }

    //% whenUsed
    export let onIdentifyRequest = () => {
        const led = pins.pinByCfg(DAL.CFG_PIN_LED);
        if (!led)
            return
        for (let i = 0; i < 7; ++i) {
            led.digitalWrite(true)
            pause(50)
            led.digitalWrite(false)
            pause(150)
        }
    }

    class ControlService extends Host {
        constructor() {
            super("ctrl", 0)
        }
        handlePacketOuter(pkt: JDPacket) {
            switch (pkt.service_command) {
                case CMD_ADVERTISEMENT_DATA:
                    queueAnnounce()
                    break
                case CMD_CTRL_IDENTIFY:
                    control.runInBackground(onIdentifyRequest)
                    break
                case CMD_CTRL_RESET:
                    control.reset()
                    break
            }
        }
    }
    export function devices() {
        return devices_.slice()
    }

    export function selfDevice() {
        if (!myDevice) {
            myDevice = new Device(control.deviceLongSerialNumber().toHex())
            myDevice.services = Buffer.create(4)
        }
        return myDevice
    }

    export function onAnnounce(cb: () => void) {
        announceCallbacks.push(cb)
    }

    export function onNewDevice(cb: () => void) {
        if (!newDeviceCallbacks) newDeviceCallbacks = []
        newDeviceCallbacks.push(cb)
    }

    function queueAnnounce() {
        const fmt = "<" + hostServices.length + "I"
        const ids = hostServices.map(h => h.running ? h.serviceClass : -1)
        JDPacket.packed(CMD_ADVERTISEMENT_DATA, fmt, ids)
            ._sendReport(selfDevice())
        announceCallbacks.forEach(f => f())
        gcDevices()
    }

    function clearAttachCache() {
        for (let d of devices_) {
            if (d.services)
                d.services[0]++
        }
    }

    function newDevice() {
        if (newDeviceCallbacks)
            for (let f of newDeviceCallbacks)
                f()
    }

    function reattach(dev: Device) {
        log(`reattaching services to ${dev.toString()}; cl=${_unattachedClients.length}/${_allClients.length}`)
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

        newDevice()

        if (_unattachedClients.length == 0)
            return

        for (let i = 0; i < dev.services.length; i += 4) {
            if (occupied[i >> 2])
                continue
            const service_class = dev.services.getNumber(NumberFormat.UInt32LE, i)
            for (let cc of _unattachedClients) {
                if (cc.serviceClass == service_class) {
                    if (cc._attach(dev, i >> 2))
                        break
                }
            }
        }
    }

    export function routePacket(pkt: JDPacket) {
        // log("route: " + pkt.toString())
        const devId = pkt.device_identifier
        const multiCommandClass = pkt.multicommand_class

        // TODO implement send queue for packet compression

        if (pkt.requires_ack) {
            pkt.requires_ack = false // make sure we only do it once
            if (pkt.device_identifier == selfDevice().deviceId) {
                const crc = pkt.crc
                const ack = JDPacket.onlyHeader(crc)
                ack.service_number = JD_SERVICE_NUMBER_CRC_ACK
                ack._sendReport(selfDevice())
            }
        }

        if (multiCommandClass != null) {
            if (!pkt.is_command)
                return // only commands supported in multi-command
            const h = hostServices.find(s => s.serviceClass == multiCommandClass);
            if (h && h.running) {
                // pretend it's directly addressed to us
                pkt.device_identifier = selfDevice().deviceId
                pkt.service_number = h.serviceNumber
                h.handlePacketOuter(pkt)
            }
        } else if (devId == selfDevice().deviceId) {
            if (!pkt.is_command)
                return // huh? someone's pretending to be us?
            const h = hostServices[pkt.service_number]
            if (h && h.running) {
                // log(`handle pkt at ${h.name} cmd=${pkt.service_command}`)
                h.handlePacketOuter(pkt)
            }
        } else {
            if (pkt.is_command)
                return // it's a command, and it's not for us

            let dev = devices_.find(d => d.deviceId == devId)

            if (pkt.service_number == JD_SERVICE_NUMBER_CTRL) {
                if (pkt.service_command == CMD_ADVERTISEMENT_DATA) {
                    if (!dev)
                        dev = new Device(pkt.device_identifier)
                    if (!pkt.data.equals(dev.services)) {
                        dev.services = pkt.data
                        dev.lastSeen = control.millis()
                        reattach(dev)
                    }
                }
                if (dev)
                    dev.lastSeen = control.millis()
                return
            } else if (pkt.service_number == JD_SERVICE_NUMBER_CRC_ACK) {
                _gotAck(pkt)
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
                // log(`handle pkt at ${client.name} rep=${pkt.service_command}`)
                client.currentDevice = dev
                client.handlePacketOuter(pkt)
            }
        }
    }

    function gcDevices() {
        const cutoff = control.millis() - 2000
        let numdel = 0
        for (let i = 0; i < devices_.length; ++i) {
            const dev = devices_[i]
            if (dev.lastSeen < cutoff) {
                devices_.splice(i, 1)
                i--
                for (let c of dev.clients) {
                    c._detach()
                }
                dev.clients = null
                numdel++
            }
        }
        if (numdel)
            newDevice()
    }

    const EVT_DATA_READY = 1;

    export function start(): void {
        if (hostServices)
            return // already started

        log("jacdac starting")

        hostServices = []
        new ControlService().start()
        _unattachedClients = []
        _allClients = []
        jacdac.__physStart();
        control.internalOnEvent(jacdac.__physId(), EVT_DATA_READY, () => {
            let buf: Buffer;
            while (null != (buf = jacdac.__physGetPacket())) {
                routePacket(JDPacket.fromBinary(buf))
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
/*
services from jacdac-v0

consoleservice.ts
debugging services?

*/

namespace jacdac {
    export let consolePriority = ConsolePriority.Debug;

    export class HostService {
        protected supressLog: boolean;
        serviceClass: number
        running = true
        name = ""
        handlePacket(pkt: JDPacket) { }

        /**
         * Registers and starts the driver
         */
        //% blockId=jacdachoststart block="start %service"
        //% group="Services" blockGap=8
        start() {
            if (this.running)
                return
            jacdac.start();
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

    export class Client {
        requiredDeviceName: string
        device: Device
        eventId: number
        controlData: Buffer
        protected supressLog: boolean;

        constructor(
            public name: string,
            public serviceClass: number,
            controlDataLength = 0
        ) {
            this.controlData = Buffer.create(Math.max(0, controlDataLength));
            this.eventId = control.allocateNotifyEvent();
        }

        handlePacketOuter(pkt: JDPacket) {
            if (pkt.service_command == CMD_GET_ADVERTISEMENT_DATA) {
                const p = new JDPacket()
                p.data = this.controlData
                p.send()
            } else {
                this.handlePacket(pkt)
            }
        }
        handlePacket(pkt: JDPacket) { }
        attach(dev: Device) {
            if (this.device) throw "Oops"
            if (this.requiredDeviceName && this.requiredDeviceName != dev.name)
                return false // don't attach
            this.device = dev
            dev.clients.push(this)
            return true
        }
        detach() {
            if (!this.device) throw "Oops"
            this.device = null
            unattachedClients.push(this)
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
    }

    const devNameSettingPrefix = "#jddev:"

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

    class ControlService extends HostService {
        handlePacket(pkt: JDPacket) {
            if (pkt.service_command == 0x8000) {
                queueAnnounce()
            }
        }
    }

    //% whenUsed
    let hostServices: HostService[] = [new ControlService()]
    //% whenUsed
    let unattachedClients: Client[] = []
    //% whenUsed
    let devices_: Device[] = []
    //% whenUsed
    let myDevice: Device

    export function devices() {
        return devices_.slice()
    }

    export function selfDevice() {
        if (!myDevice)
            myDevice = new Device(control.deviceLongSerialNumber().toHex())
        return myDevice
    }

    function queueAnnounce() {
        const pkt = new JDPacket()
        const fmt = "<" + hostServices.length + "I"
        const ids = hostServices.map(h => h.running ? h.serviceClass : -1)
        pkt.pack(fmt, ids)
        pkt.send()
    }

    export function routePacket(pkt: JDPacket) {
        const devId = pkt.device_identifier
        if (devId == selfDevice().deviceId) {
            if (!pkt.is_command)
                return // huh? someone's pretending to be us?
            const h = hostServices[pkt.service_number - 1]
            if (h && h.running) h.handlePacket(pkt)
        } else {
            if (pkt.is_command)
                return // it's a command, and it's not for us

            let dev = devices_.find(d => d.deviceId == devId)
            if (!dev) {
                if (pkt.service_number == 0 && pkt.service_command == 0) {
                    dev = new Device(pkt.device_identifier)
                } else {
                    // we can't know the service_class, no announcement seen yet for this device
                    return
                }
            }

            dev.lastSeen = control.millis()

            if (pkt.service_number == 0 && pkt.service_command == 0) {
                dev.services = pkt.data
                return
            }

            const service_class = dev.services.getNumber(NumberFormat.UInt32LE, pkt.service_number << 2)
            if (!service_class || service_class == 0xffffffff)
                return

            let client = dev.clients.find(c => c.serviceClass == service_class)
            if (!client) {
                for (let cc of unattachedClients) {
                    if (cc.serviceClass == service_class) {
                        if (cc.attach(dev)) {
                            client = cc
                            break
                        }
                    }
                }
            }

            if (client)
                client.handlePacketOuter(pkt)
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
                    c.detach()
                }
                dev.clients = null
            }
        }
    }

    export function start(): void {
        if (jacdac.__physIsRunning())
            return

        hostServices = [new ControlService()]
        myDeviceId = control.deviceLongSerialNumber().toHex()
        jacdac.__physStart();
        control.internalOnEvent(jacdac.__physId(), DAL.JD_SERIAL_EVT_DATA_READY, () => {
            let buf: Buffer;
            while (null != (buf = jacdac.__physGetPacket())) {
                routePacket(new JDPacket(buf))
            }
            gcDevices()
        });
        control.internalOnEvent(jacdac.__physId(), 100, queueAnnounce);

        /*
        console.addListener(function (pri, msg) {
            jacdac.JACDAC.instance.consoleService.add(<jacdac.JDConsolePriority><number>pri, msg);
        });
        */
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

    export interface JDSerializable {
        getBuffer(): Buffer;
    }

    export const JD_SERIAL_HEADER_SIZE = 16
    export const JD_SERIAL_MAX_PAYLOAD_SIZE = 236

    function error(msg: string) {
        throw msg
    }

    export class JDPacket implements JDSerializable {
        _buffer: Buffer;

        constructor(buf?: Buffer) {
            if (buf) {
                if (buf.length < JD_SERIAL_HEADER_SIZE)
                    error("invalid buffer size")
                this._buffer = buf
            }
            else
                this._buffer = control.createBuffer(JD_SERIAL_MAX_PAYLOAD_SIZE + JD_SERIAL_HEADER_SIZE);
        }

        get device_identifier() {
            // second 8 is length!
            return this._buffer.slice(8, 8).toHex()
        }
        set device_identifier(id: string) {
            const idb = control.createBufferFromHex(id)
            if (idb.length != 8)
                error("Invalid id")
            this._buffer.write(8, idb)
        }

        get size(): number {
            return this._buffer[2];
        }
        set size(size: number) {
            if (0 < size && size <= JD_SERIAL_MAX_PAYLOAD_SIZE)
                this._buffer[2] = size
            else
                error("invalid size")
        }

        get service_number(): number {
            return this._buffer[3];
        }
        set service_number(service_number: number) {
            this._buffer[3] = service_number;
        }

        get service_command(): number {
            return this._buffer.getNumber(NumberFormat.UInt16LE, 4)
        }
        set service_command(cmd: number) {
            this._buffer.setNumber(NumberFormat.UInt16LE, 4, cmd)
        }

        get service_argument(): number {
            return this._buffer.getNumber(NumberFormat.UInt16LE, 6)
        }
        set service_argument(arg: number) {
            this._buffer.setNumber(NumberFormat.UInt16LE, 6, arg)
        }

        get data(): Buffer {
            return this._buffer.slice(JD_SERIAL_HEADER_SIZE, this.size)
        }

        set data(buf: Buffer) {
            this.size = buf.length;
            this._buffer.write(JD_SERIAL_HEADER_SIZE, buf)
        }

        pack(fmt: string, nums: number[]) {
            this.size = Buffer.packedSize(fmt)
            this._buffer.packAt(JD_SERIAL_HEADER_SIZE, fmt, nums)
        }

        get is_command() {
            return !!(this.service_command & 0x8000)
        }

        getBuffer(): Buffer {
            return this._buffer;
        }

        toString(): string {
            return this._buffer.toHex();
        }

        send() {
            jacdac.__physSendPacket(this._buffer)
        }
    }

}
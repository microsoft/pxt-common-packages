namespace jacdac2 {
    export class HostService {
        service_class: number
        running = true
        handlePacket(pkt: JDPacket) { }
        start() {
            start()
            hostServices.push(this)
            this.running = true
        }
        stop() {
            this.running = false
        }
    }

    export class Client {
        service_class: number
        name: string
        device: Device
        handlePacket(pkt: JDPacket) { }
        attach(dev: Device) {
            if (this.device) throw "Oops"
            if (this.name && this.name != dev.name)
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
    }

    const devNameSettingPrefix = "#jddev:"

    export class Device {
        deviceId: string
        services: Buffer
        lastSeen: number
        clients: Client[] = []

        get name() {
            return settings.readString(devNameSettingPrefix + this.deviceId)
        }

        set name(n: string) {
            settings.writeString(devNameSettingPrefix + this.deviceId, n)
        }
    }

    class ControlService extends HostService {
        handlePacket(pkt: JDPacket) {
            if (pkt.service_command == 0x8000) {
                queueAnnounce()
            }
        }
    }

    let myDeviceId: string
    //% whenUsed
    let hostServices: HostService[] = [new ControlService()]
    //% whenUsed
    let unattachedClients: Client[] = []
    //% whenUsed
    let devices_: Device[] = []

    export function devices() {
        return devices_.slice()
    }

    function queueAnnounce() {
        const pkt = new JDPacket()
        let fmt = "<"
        const ids = hostServices.map(h => {
            fmt += "I"
            if (h.running) return h.service_class
            else return -1
        })
        pkt.data = pins.packBuffer(fmt, ids)
        pkt.send()
    }

    export function routePacket(pkt: JDPacket) {
        const devId = pkt.device_identifier
        if (devId == myDeviceId) {
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
                    dev = new Device()
                    dev.deviceId = pkt.device_identifier
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

            let client = dev.clients.find(c => c.service_class == service_class)
            if (!client) {
                for (let cc of unattachedClients) {
                    if (cc.service_class == service_class) {
                        if (cc.attach(dev)) {
                            client = cc
                            break
                        }
                    }
                }
            }

            if (client)
                client.handlePacket(pkt)
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
            ] = pins.unpackBuffer("<IIIIIII", buf)
        }
    }

    export interface JDSerializable {
        getBuffer(): Buffer;
    }

    const JD_SERIAL_HEADER_SIZE = 16
    const JD_SERIAL_MAX_PAYLOAD_SIZE = 236

    function error(msg: string) {
        throw new Error(msg)
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
namespace jacdac {
    const DNS_CMD_GET_NAME = 0x80
    const DNS_CMD_SET_NAME = 0x81
    const DNS_CMD_LIST_STORED_IDS = 0x82
    const DNS_CMD_LIST_USED_NAMES = 0x83
    const DNS_CMD_CLEAR_STORED_IDS = 0x84

    export class DeviceNameService extends Host {
        constructor() {
            super("dns", jd_class.DEVICE_NAME_SERVICE)
        }

        public handlePacket(packet: JDPacket) {
            switch (packet.service_command) {
                case DNS_CMD_GET_NAME:
                    if (packet.data.length == 8) {
                        const name = settings.readBuffer(devNameSettingPrefix + packet.data.toHex())
                        this.sendReport(JDPacket.from(DNS_CMD_GET_NAME, packet.data.concat(name)))
                    }
                    break
                case DNS_CMD_SET_NAME:
                    if (packet.data.length >= 8) {
                        const devid = devNameSettingPrefix + packet.data.slice(0, 8).toHex()
                        const name = packet.data.slice(8)
                        if (name.length == 0)
                            settings.remove(devid)
                        else
                            settings.writeBuffer(devid, name)
                        Device.clearNameCache()
                    }
                    break
                case DNS_CMD_LIST_STORED_IDS:
                    this.sendChunkedReport(DNS_CMD_LIST_STORED_IDS,
                        settings.list(devNameSettingPrefix)
                            .map(k => Buffer.fromHex(k.slice(devNameSettingPrefix.length))))
                    break
                case DNS_CMD_LIST_USED_NAMES:
                    const attachedClients = _allClients.filter(c => !!c.requiredDeviceName)
                    this.sendChunkedReport(DNS_CMD_LIST_USED_NAMES, attachedClients.map(packName))
                    break
                case DNS_CMD_CLEAR_STORED_IDS:
                    settings.list(devNameSettingPrefix).forEach(settings.remove)
                    break
            }

            function packName(c: Client) {
                const devid = c.device ? Buffer.fromHex(c.device.deviceId) : Buffer.create(8)
                const name = Buffer.fromUTF8(c.requiredDeviceName)
                const devdesc = Buffer.pack("Ib", [c.serviceClass, name.length])
                return devid.concat(devdesc).concat(name)
            }
        }
    }

    //% fixedInstance whenUsed block="device name service"
    export const deviceNameService = new DeviceNameService()

    export class Dechunker {
        pending: Buffer[]
        previous: Buffer

        constructor(
            public cmd: number,
            public onUpdate: (b: Buffer) => void
        ) { }

        handlePacket(pkt: JDPacket): boolean {
            if (pkt.service_command != this.cmd)
                return false

            const [currno, total] = pkt.data.unpack("HH")
            if (currno == 0)
                this.pending = []
            else if (!this.pending)
                return true

            if (this.pending.length != currno) {
                this.pending = null
                return true
            }

            this.pending.push(pkt.data.slice(4))

            if (currno == total - 1) {
                const r = Buffer.concat(this.pending)
                this.pending = null
                if (!this.previous || !this.previous.equals(r)) {
                    this.previous = r
                    this.onUpdate(r)
                }
            }

            return true
        }
    }

    export class RemoteNamedDevice {
        services: number[] = [];
        boundTo: Device;
        candidates: Device[] = [];

        constructor(
            public parent: DeviceNameClient,
            public name: string
        ) { }

        isCandidate(ldev: Device) {
            return this.services.every(s => ldev.hasService(s))
        }

        select(dev: Device) {
            if (dev == this.boundTo)
                return
            if (this.boundTo)
                this.parent.setName(this.boundTo, "")
            this.parent.setName(dev, this.name)
            this.boundTo = dev
        }
    }

    export class DeviceNameClient extends Client {
        public remoteNamedDevices: RemoteNamedDevice[] = []

        private usedNames: Dechunker
        constructor(requiredDevice: string = null) {
            super("dnsc", jd_class.DEVICE_NAME_SERVICE, requiredDevice)

            onNewDevice(() => {
                this.recomputeCandidates()
            })

            onAnnounce(() => {
                this.sendCommand(JDPacket.onlyHeader(DNS_CMD_LIST_USED_NAMES))
            })

            this.usedNames = new Dechunker(DNS_CMD_LIST_USED_NAMES, buf => {
                let off = 0
                const devs: RemoteNamedDevice[] = []
                const localDevs = devices()
                while (off < buf.length) {
                    const devid = buf.slice(off, 8).toHex()
                    off += 8
                    const [service_class, nameBytes] = buf.unpack("Ib", off)
                    off += 5
                    const name = buf.slice(off, nameBytes).toString()
                    off += nameBytes

                    let r = devs.find(d => d.name == name)
                    if (!r)
                        devs.push(r = new RemoteNamedDevice(this, name))
                    r.services.push(service_class)

                    const dev = localDevs.find(d => d.deviceId == devid)
                    if (dev)
                        r.boundTo = dev
                }

                devs.sort((a, b) => a.name.compare(b.name))

                this.remoteNamedDevices = devs
                this.recomputeCandidates()
            })
        }

        private recomputeCandidates() {
            const localDevs = devices()
            for (let dev of this.remoteNamedDevices)
                dev.candidates = localDevs.filter(ldev => dev.isCandidate(ldev))
        }

        scan() {
            pauseUntil(() => this.isConnected())
            this.sendCommand(JDPacket.onlyHeader(DNS_CMD_LIST_USED_NAMES))
            pause(100)
        }

        clearNames() {
            this.sendCommand(JDPacket.onlyHeader(DNS_CMD_CLEAR_STORED_IDS), true)
        }

        setName(dev: Device, name: string) {
            this.sendCommand(JDPacket.from(DNS_CMD_SET_NAME,
                Buffer.fromHex(dev.deviceId).concat(Buffer.fromUTF8(name))), true)
        }

        handlePacket(pkt: JDPacket) {
            this.usedNames.handlePacket(pkt)
        }
    }
}
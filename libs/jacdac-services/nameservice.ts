namespace jacdac {
    const DNS_CMD_GET_NAME = 0x80
    const DNS_CMD_SET_NAME = 0x81
    const DNS_CMD_LIST_STORED_IDS = 0x82
    const DNS_CMD_LIST_MISSING_NAMES = 0x83
    const DNS_CMD_LIST_USED_NAMES = 0x84
    const DNS_CMD_CLEAR_STORED_IDS = 0x85

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
                case DNS_CMD_LIST_MISSING_NAMES:
                    this.sendChunkedReport(DNS_CMD_LIST_MISSING_NAMES,
                        _unattachedClients.filter(c => !!c.requiredDeviceName).map(packName))
                    break
                case DNS_CMD_LIST_USED_NAMES:
                    const attachedClients = _allClients.filter(c => c.device != null && !!c.requiredDeviceName)
                    this.sendChunkedReport(DNS_CMD_LIST_USED_NAMES, attachedClients.map(packName))
                    break
                case DNS_CMD_CLEAR_STORED_IDS:
                    settings.list(devNameSettingPrefix).forEach(settings.remove)
                    break
            }

            function packName(c: Client) {
                const name = Buffer.fromUTF8(c.requiredDeviceName)
                return Buffer.pack("Ib", [c.serviceClass, name.length]).concat(name)
            }
        }
    }

    export class DeviceNameClient extends Client {
        constructor() {
            super("dnsc", jd_class.DEVICE_NAME_SERVICE)
        }
    }
}
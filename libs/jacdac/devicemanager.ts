namespace jacdac {
    export class JDDeviceManager {
        devices: JDDevice[];

        constructor() {
            this.devices = [];
        }

        getDeviceList(): JDDevice[] {
            return this.devices.slice(0);
        }

        getRemoteDevice(device_address: number): JDDevice {
            return this.devices.find((dev) => { return dev.device_address == device_address });
        }

        getRemoteDeviceUnique(device_address: number, cp: JDControlPacket): JDDevice {
            const udidl = cp.udidl
            const udidh = cp.udidh
            return this.devices.find((dev) => dev.device_address == device_address && dev.udidh == udidh && dev.udidl == udidl);
        }

        addDevice(controlPacket: JDControlPacket, communicationRate: number): JDDevice {
            let dev = this.getRemoteDeviceUnique(controlPacket.device_address, controlPacket);

            if (dev)
                return dev;

            dev = new JDDevice(controlPacket, communicationRate);

            this.devices.push(dev);

            return dev;
        }

        updateDevice(controlPacket: JDControlPacket, communicationRate: number): void {
            const dev = this.getRemoteDeviceUnique(controlPacket.device_address, controlPacket);

            if (dev)
                dev.update(controlPacket);
        }

        removeDevice(device: JDDevice): void {
            this.devices = this.devices.filter((dev) => !(dev.device_address == device.device_address && device.udidl == dev.udidl && device.udidh == dev.udidh))
        }
    }
}
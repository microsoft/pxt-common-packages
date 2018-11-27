namespace pxsim.jacdac {

    export function start() {
        const state = getJacDacState();
        if (!state) return;
        state.start();
    }

    export function stop() {
        const state = getJacDacState();
        if (!state) return;
        state.stop();
    }

    export function __internalSendPacket(packet: pxsim.RefBuffer, address: number): number {
        const state = getJacDacState();
        if (state)
            state.sendPacket(packet, address);
        return 0;
    }

    export function __internalAddDriver(
        driverType: number,
        deviceClass: number,
        methods: ((p: pxsim.RefBuffer) => boolean)[],
        controlData: pxsim.RefBuffer
    ): pxsim.JacDacDriverStatus {
        const state = getJacDacState();
        const d = new pxsim.JacDacDriverStatus(driverType, deviceClass, methods, controlData);
        if (state)
            state.addDriver(d);
        return d;
    }

    export class JDDevice {
        buf: pxsim.RefBuffer;
        constructor(buf: pxsim.RefBuffer) {
            this.buf = buf;
        }

        static mk(address: number, flags: number, serialNumber: number, driverClass: number) {
            const buf = BufferMethods.createBuffer(12);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt8LE, 0, address);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt8LE, 1, 0); // rolling counter
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt16LE, 2, flags);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt16LE, 4, serialNumber);
            BufferMethods.setNumber(buf, BufferMethods.NumberFormat.UInt16LE, 8, driverClass);
            return new JDDevice(buf);
        }

        get driverAddress(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 0);
        }
        set driverAddress(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 0, value);
        }
        get rollingCounter(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 1);
        }
        get flags(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 2);
        }
        get serialNumber(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 4);
        }
        get driverClass(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 8);
        }
    }


}
namespace pxsim {
    export class JacDacDriverStatus {
        dev: pxsim.jacdac.JDDevice;
        device: pxsim.RefBuffer;
        id: number;
        constructor(
            driverType: number,
            deviceClass: number,
            public methods: ((p: pxsim.RefBuffer) => boolean)[],
            public controlData: pxsim.RefBuffer) {
            this.id = pxsim.control.allocateNotifyEvent();
            this.dev = pxsim.jacdac.JDDevice.mk(0, driverType, 0, deviceClass);
            this.device = this.dev.buf;
        }
    }
}
namespace pxsim.JacDacDriverStatusMethods {
    export function isPairedInstanceAddress(proxy: JacDacDriverStatus, address: number): number {
        return 0;
    }
    export function setBridge(proxy: JacDacDriverStatus): void {

    }
    export function id(proxy: JacDacDriverStatus): number {
        return proxy.id;
    }
    export function device(proxy: JacDacDriverStatus): pxsim.RefBuffer {
        return proxy.device;
    }
    export function isConnected(proxy: JacDacDriverStatus): boolean {
        return false;
    }
}
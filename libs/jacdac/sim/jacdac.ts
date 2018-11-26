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

        get address(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 0);
        }
        set address(value: number) {
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
        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the VirtualDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in VirtualDriver mode.
         **/
        isVirtualDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_REMOTE) && !(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the PairedDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in PairedDriver mode.
         **/
        isPairedDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST) && !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIR);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the HostDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in SnifferDriver mode.
         **/
        isHostDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_LOCAL) && !(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the BroadcastDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in BroadcastDriver mode.
         **/
        isBroadcastDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_LOCAL) && !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the SnifferDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in SnifferDriver mode.
         **/
        isSnifferDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_REMOTE) && !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Indicates if the driver is currently paired to another.
         *
         * @returns true if paired
         **/
        isPaired(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRED);
        }

        /**
         * Indicates if the driver can be currently paired to another.
         *
         * @returns true if pairable
         **/
        isPairable(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRABLE);
        }

        /**
         * Indicates if the driver is currently in the process of pairing to another.
         *
         * @returns true if pairing
         **/
        isPairing(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRING);
        }
    }
}
namespace pxsim {
    export class JacDacDriverStatus {
        device: pxsim.jacdac.JDDevice;
        id: number;
        constructor(
            driverType: number,
            deviceClass: number,
            public methods: ((p: pxsim.RefBuffer) => boolean)[],
            public controlData: pxsim.RefBuffer) {
            this.id = pxsim.control.allocateNotifyEvent();
            this.device = pxsim.jacdac.JDDevice.mk(0, driverType, 0, deviceClass);
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
        return proxy.device.buf;
    }
    export function isConnected(proxy: JacDacDriverStatus): boolean {
        return false;
    }
}
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
        isVirtualDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_REMOTE) && !(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }
        isPairedDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST) && !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIR);
        }
        isHostDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_LOCAL) && !(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }
        isBroadcastDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_LOCAL) && !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }
        isSnifferDriver(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_REMOTE) && !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }
        isPaired(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRED);
        }
        isPairable(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRABLE);
        }
        isPairing(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRING);
        }
    }

    export class JDPacket {
        buf: RefBuffer;
        constructor(buf: RefBuffer) {
            this.buf = buf;
        }
        get crc(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 0);
        }
        get address(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 2);
        }
        get size(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 3);
        }
        getNumber(format: BufferMethods.NumberFormat, offset: number) {
            return BufferMethods.getNumber(this.buf, format, offset + 4);
        }

        setNumber(format: BufferMethods.NumberFormat, offset: number, value: number) {
            BufferMethods.setNumber(this.buf, format, offset + 4, value);
        }
    }

    export class ControlPacket {
        buf: RefBuffer;
        constructor(buf: RefBuffer) {
            this.buf = buf;
        }
        get packetType(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 0);
        }
        set packetType(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 0, value);
        }
        get address(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 1);
        }
        set address(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 1, value);
        }
        get flags(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 2);
        }
        set flags(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 2, value);
        }
        get driverClass(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 4);
        }
        set driverClass(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 4, value);
        }
        get serialNumber(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 8);
        }
        set serialNumber(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 8, value);
        }
    }

    export class JDLogicDriver {
        device: JDDevice;
        status: number;
        address_filters: Map<boolean>;
        constructor() {
            this.device = JDDevice.mk(0, DAL.JD_DEVICE_FLAGS_LOCAL | DAL.JD_DEVICE_FLAGS_INITIALISED, 0, 0);
            this.device.address = 0;
            this.status = 0;
            this.address_filters = {};
            this.status |= (DAL.DEVICE_COMPONENT_RUNNING | DAL.DEVICE_COMPONENT_STATUS_SYSTEM_TICK);
        }
        populateControlPacket(driver: JacDacDriverStatus, cp: ControlPacket) {
            cp.packetType = DAL.CONTROL_JD_TYPE_HELLO;
            cp.address = driver.device.address;
            cp.flags = 0;

            if (driver.device.isPairing())
                cp.flags |= DAL.CONTROL_JD_FLAGS_PAIRING_MODE;

            if (driver.device.isPaired())
                cp.flags |= DAL.CONTROL_JD_FLAGS_PAIRED;

            if (driver.device.isPairable())
                cp.flags |= DAL.CONTROL_JD_FLAGS_PAIRABLE;

            cp.driverClass = driver.device.driverClass;
            cp.serialNumber = driver.device.serialNumber;
        }
        handleControlPacket(p: JDPacket) {
            return DAL.DEVICE_OK;
        }

        addToFilter(address: number): number {
            this.address_filters[address] = true;
            return DAL.DEVICE_OK;
        }

        removeFromFilter(address: number): number {
            delete this.address_filters[address];
            return DAL.DEVICE_OK;
        }

        filterPacket(address: number): boolean {
            if (address > 0) {
                return !!this.address_filters[address];
            }
            return false;
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
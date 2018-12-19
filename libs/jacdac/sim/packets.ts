namespace pxsim.jacdac {
    export class JDDevice {
        static SIZE = 12;

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
        set rollingCounter(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 1, value);
        }
        get flags(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 2);
        }
        set flags(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 2, value);
        }
        get serialNumber(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 4);
        }
        set serialNumber(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 4, value);
        }
        get driverClass(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt32LE, 8);
        }
        set error(e: number) {
            const f = this.flags & ~(DAL.JD_DEVICE_ERROR_MSK);
            this.flags = f | (e & 0xff);
        }
        get error(): number {
            return this.flags & DAL.JD_DEVICE_ERROR_MSK;
        }
        isConnected(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_INITIALISED);
        }
        isConnecting(): boolean {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_INITIALISING);
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
        static mk(data: RefBuffer, address: number): JDPacket {
            const size = BufferMethods.length(data);
            const buf = pxsim.BufferMethods.createBuffer(4 + size);
            const r = new JDPacket(buf);
            r.address = address;
            r.data = data;
            r.size = size;
            return r;
        }
        get crc(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt16LE, 0);
        }
        get address(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 2);
        }
        set address(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 2, value);
        }
        get size(): number {
            return BufferMethods.getNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 3);
        }
        set size(value: number) {
            BufferMethods.setNumber(this.buf, BufferMethods.NumberFormat.UInt8LE, 3, value);
        }
        get data(): RefBuffer {
            return BufferMethods.slice(this.buf, 4, this.buf.data.length - 4);
        }
        set data(value: RefBuffer) {
            const n = BufferMethods.length(value);
            for (let i = 0; i < n; ++i)
                this.setNumber(BufferMethods.NumberFormat.UInt8BE, i, BufferMethods.getNumber(value, BufferMethods.NumberFormat.UInt8LE, i));
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
            if (!buf) {
                buf = pxsim.BufferMethods.createBuffer(12);
                for (let i = 0; i < buf.data.length; ++i)
                    buf.data[i] = Math_.randomRange(0, 255);
            }
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
}
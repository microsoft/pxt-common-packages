namespace jacdac {
    export class JDPacket {
        buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }
        get crc(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 0);
        }
        get address(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 2);
        }
        get size(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 3);
        }
        get data(): Buffer {
            return this.buf.slice(4);
        }

        getNumber(format: NumberFormat, offset: number) {
            return this.buf.getNumber(format, offset + 4);
        }

        setNumber(format: NumberFormat, offset: number, value: number) {
            this.buf.setNumber(format, offset + 4, value);
        }
    }

    export class ControlPacket {
        buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }
        get packetType(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 0);
        }
        get address(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 1);
        }
        get flags(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 2);
        }
        get driverClass(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
        }
        get serialNumber(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 8);
        }
        get data(): Buffer {
            return this.buf.slice(12);
        }

        toString(): string {
            const buf = control.createBuffer(4);
            function toHex(n: number): string {
                buf.setNumber(NumberFormat.UInt32LE, 4, n);
                return buf.toHex();
            }
            return `${toHex(this.serialNumber & 0xffff)}> d${toHex(this.address)} c${toHex(this.driverClass)} ${this.data.toHex()}`;
        }
    }

    /*
        struct JDDevice
    {
        uint8_t address; // the address assigned by the logic driver.
        uint8_t rolling_counter; // used to trigger various time related events
        uint16_t flags; // various flags indicating the state of the driver
        uint32_t serial_number; // the serial number used to "uniquely" identify a device
        uint32_t driver_class; // the class of the driver, created or selected from the list in JDClasses.h
        */
    export class JDDevice {
        static SIZE = 12;
        buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }

        static mk(address: number, flags: number, serialNumber: number, driverClass: number) {
            const buf = control.createBuffer(JDDevice.SIZE);
            buf.setNumber(NumberFormat.UInt8LE, 0, address);
            buf.setNumber(NumberFormat.UInt8LE, 1, 0); // rolling counter
            buf.setNumber(NumberFormat.UInt16LE, 2, flags);
            buf.setNumber(NumberFormat.UInt16LE, 4, serialNumber);
            buf.setNumber(NumberFormat.UInt16LE, 8, driverClass);
            return new JDDevice(buf);
        }

        get address(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 0);
        }
        get rollingCounter(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 1);
        }
        get flags(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 2);
        }
        set flags(value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, 2, value);    
        }
        get serialNumber(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
        }
        set serialNumber(value: number) {
            this.buf.setNumber(NumberFormat.UInt32LE, 4, value);
        }
        setMode(m: DriverType, initialised = false) {
            this.flags &= ~DAL.JD_DEVICE_DRIVER_MODE_MSK;
            this.flags |= m;
            if (initialised)
                this.flags |= DAL.JD_DEVICE_FLAGS_INITIALISED;
            else
                this.flags &= ~DAL.JD_DEVICE_FLAGS_INITIALISED;
        }
        get driverClass(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 8);
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

        toString(): string {
            const buf = control.createBuffer(4);
            function toHex(n: number, format: NumberFormat): string {
                buf.fill(0);
                buf.setNumber(NumberFormat.UInt32LE, 0, n);
                return buf.toHex();
            }
            return `${toHex(this.serialNumber, NumberFormat.UInt32LE)} @${toHex(this.address, NumberFormat.UInt8LE)} c${toHex(this.driverClass, NumberFormat.UInt16LE)}`;
        }
    }
}
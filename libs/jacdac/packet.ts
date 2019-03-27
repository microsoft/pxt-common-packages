namespace jacdac {
    export class JDPacket {
        buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }
        get crc(): number {
            // crc is stored in the first 12 bits, service number in the final 4 bits
            return this.buf.getNumber(NumberFormat.UInt16LE, 0) >> 4;
        }
        get serviceNumber(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 1) & 0x0f;
        }
        /**
         * control is 0, devices are allocated address in the range 1 - 255
         */
        get deviceAddress(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 2);
        }
        /**
         * the size, address, and crc are not included by the size variable. 
         * The size of a packet dictates the size of the data field.
         */
        get size(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 3);
        }
        get data(): Buffer {            
            return this.buf.slice(4, this.size);
        }
        get communicationRate(): number {            
            return this.buf.getNumber(NumberFormat.UInt8LE, this.buf.length - 1);
        }

        getNumber(format: NumberFormat, offset: number) {
            return this.buf.getNumber(format, offset + 4);
        }
        setNumber(format: NumberFormat, offset: number, value: number) {
            this.buf.setNumber(format, offset + 4, value);
        }
    }

    /**
     * This struct represents a JDControlPacket used by the logic service
     * A control packet provides full information about a service, it's most important use is to translates the address used in
     * standard packets to the full service information. Standard packet address == control packet address.
     *
     * Currently there are two types of packet:
     * CONTROL_JD_TYPE_HELLO - Which broadcasts the availablity of a service
     * CONTROL_JD_TYPE_PAIRING_REQUEST - Used when services are pairing to one another.
    struct JDControlPacket
    {
        uint64_t udid; // the "unique" serial number of the device.
        uint8_t device_address;
        uint8_t device_flags;
        uint8_t data[];
    } __attribute((__packed__));
    */
    export class JDControlPacket {
        buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }
        /**
         * the "unique" serial number of the device.
         */
        get udid(): Buffer {
            return this.buf.slice(0, 4);
        }
        get deviceAddress(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 5);
        }
        get deviceFlags(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 6);
        }
        get data(): Buffer {
            return this.buf.slice(7);
        }

        toString(): string {
            const buf = control.createBuffer(4);
            function toHex(n: number): string {
                buf.setNumber(NumberFormat.UInt32LE, 4, n);
                return buf.toHex();
            }
            return `${this.udid.toHex()}> d${toHex(this.deviceAddress)} ${this.data.toHex()}`;
        }
    }

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

    /*
struct JDDevice
{
    uint64_t udid;
    uint8_t device_flags;
    uint8_t device_address;
    uint8_t communication_rate;
    uint8_t rolling_counter;
    uint16_t servicemap_bitmsk;
    uint8_t broadcast_servicemap[JD_DEVICE_MAX_HOST_SERVICES / 2]; // use to map remote broadcast services to local broadcast services.
    JDDevice* next;
    uint8_t* name;
};
        */

        /**
         * the "unique" serial number of the device.
         */
        get udid(): Buffer {
            return this.buf.slice(0, 4);
        }
        get deviceAddress(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 6);
        }
        get deviceFlags(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 5);
        }
        set deviceFlags(value: number) {
            this.buf.setNumber(NumberFormat.UInt8LE, 5, value);
        }
        get communicationRate(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 7);
        }
        get rollingCounter(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 8);
        }
        get serviceBitmask(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 9);
        }

        /*
    uint8_t broadcast_servicemap[JD_DEVICE_MAX_HOST_SERVICES / 2]; // use to map remote broadcast services to local broadcast services.
    JDDevice* next;
    uint8_t* name;
        */

        setMode(m: DriverType, initialised = false) {
            this.deviceFlags &= ~DAL.JD_DEVICE_DRIVER_MODE_MSK;
            this.deviceFlags |= m;
            if (initialised)
                this.deviceFlags |= DAL.JD_DEVICE_FLAGS_INITIALISED;
            else
                this.deviceFlags &= ~DAL.JD_DEVICE_FLAGS_INITIALISED;
        }
        get driverClass(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 8);
        }

        get error(): JDDriverErrorCode {
            return this.deviceFlags & DAL.JD_DEVICE_ERROR_MSK;
        }
        set error(e: JDDriverErrorCode) {
            const f = this.deviceFlags & ~(DAL.JD_DEVICE_ERROR_MSK);
            this.deviceFlags = f | (e & 0xff);
        }

        /**
         * Indicates if the driver is connected on the bus
         */
        isConnected(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_INITIALISED);
        }

        /**
        * Indicates if the driver is connecting on the bus
        */
        isConnecting(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_INITIALISING);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the VirtualDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in VirtualDriver mode.
         **/
        isVirtualDriver(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_REMOTE) && !(this.deviceFlags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the PairedDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in PairedDriver mode.
         **/
        isPairedDriver(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_BROADCAST) && !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_PAIR);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the HostDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in SnifferDriver mode.
         **/
        isHostDriver(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_LOCAL) && !(this.deviceFlags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the BroadcastDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in BroadcastDriver mode.
         **/
        isBroadcastDriver(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_LOCAL) && !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the SnifferDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in SnifferDriver mode.
         **/
        isSnifferDriver(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_REMOTE) && !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Indicates if the driver is currently paired to another.
         *
         * @returns true if paired
         **/
        isPaired(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_PAIRED);
        }

        /**
         * Indicates if the driver can be currently paired to another.
         *
         * @returns true if pairable
         **/
        isPairable(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_PAIRABLE);
        }

        /**
         * Indicates if the driver is currently in the process of pairing to another.
         *
         * @returns true if pairing
         **/
        isPairing(): boolean {
            return !!(this.deviceFlags & DAL.JD_DEVICE_FLAGS_PAIRING);
        }

        toString(): string {
            const buf = control.createBuffer(4);
            function toHex(n: number, format: NumberFormat): string {
                buf.fill(0);
                buf.setNumber(NumberFormat.UInt32LE, 0, n);
                return buf.toHex();
            }
            return `${toHex(this.deviceAddress, NumberFormat.UInt8LE)} ${toHex(this.driverClass, NumberFormat.UInt16LE)} ${toHex(this.serialNumber, NumberFormat.UInt32LE)} ${this.isConnected() ? "v" : "x"}`;
        }
    }
}
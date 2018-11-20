enum JacDacDriverEvent {
    Connected = DAL.JD_DRIVER_EVT_CONNECTED,
    Disconnected = DAL.JD_DRIVER_EVT_DISCONNECTED,
    Paired = DAL.JD_DRIVER_EVT_PAIRED,
    Unpaired = DAL.JD_DRIVER_EVT_UNPAIRED,
    PairingRefused = DAL.JD_DRIVER_EVT_PAIR_REJECTED,
    PairingResponse = DAL.JD_DRIVER_EVT_PAIRING_RESPONSE
}

class JacDacDriver {
    public name: string;
    public status: JacDacDriverStatus;
    public driverType: jacdac.DriverType;
    public deviceClass: number;
    protected supressLog: boolean;

    constructor(name: string, driverType: jacdac.DriverType, deviceClass: number, suppressLog: boolean = false) {
        this.name = name;
        this.driverType = driverType;
        this.deviceClass = deviceClass || jacdac.programHash();
        this.supressLog = suppressLog;
    }

    get isConnected(): boolean {
        return this.status && this.status.isConnected;
    }

    protected get device(): jacdac.JDDevice {
        return new jacdac.JDDevice(this.status.device);
    }

    public log(text: string) {
        if (!this.supressLog)
            console.add(jacdac.consolePriority, `jd>${this.name}>${text}`);
    }

    /**
     * Registers code to run a on a particular event
     * @param event 
     * @param handler 
     */
    public onDriverEvent(event: JacDacDriverEvent, handler: () => void) {
        control.onEvent(this.status.id, event, handler);
    }

    /**
     * Called by the logic driver when a data packet is addressed to this driver
     * Return false when the packet wasn't handled here.
     */
    public handlePacket(pkt: Buffer): boolean {
        return false
    }

    protected sendPacket(pkt: Buffer) {
        // this.log(`send pkt ${this.device.driverAddress}`)
        jacdac.sendPacket(pkt, this.device.driverAddress);
    }
}

/**
 * JACDAC protocol support
 */
namespace jacdac {
    // TODO allocate ID in DAL
    export const LOGGER_DRIVER_CLASS = 4220;

    // common logging level for jacdac services
    export let consolePriority = ConsolePriority.Silent;

    // This enumeration specifies that supported configurations that drivers should utilise.
    // Many combinations of flags are supported, but only the ones listed here have been fully implemented.
    export enum DriverType {
        VirtualDriver = DAL.JD_DEVICE_FLAGS_REMOTE, // the driver is seeking the use of another device's resource
        PairedDriver = DAL.JD_DEVICE_FLAGS_BROADCAST | DAL.JD_DEVICE_FLAGS_PAIR,
        HostDriver = DAL.JD_DEVICE_FLAGS_LOCAL, // the driver is hosting a resource for others to use.
        PairableHostDriver = DAL.JD_DEVICE_FLAGS_PAIRABLE | DAL.JD_DEVICE_FLAGS_LOCAL, // the driver is allowed to pair with another driver of the same class
        BroadcastDriver = DAL.JD_DEVICE_FLAGS_LOCAL | DAL.JD_DEVICE_FLAGS_BROADCAST, // the driver is enumerated with its own address, and receives all packets of the same class (including control packets)
        SnifferDriver = DAL.JD_DEVICE_FLAGS_REMOTE | DAL.JD_DEVICE_FLAGS_BROADCAST, // the driver is not enumerated, and receives all packets of the same class (including control packets)
    };

    /**
     * base class for pairable drivers
    */
    export class PairableDriver extends JacDacDriver {
        constructor(name: string, isHost: boolean, deviceClass: number) {
            super(name, isHost ? DriverType.PairableHostDriver : DriverType.PairedDriver, deviceClass);
        }

        protected canSendPacket(): boolean {
            return this.isConnected && this.device.isPaired;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            this.log(`rec ${packet.data.length}b from ${packet.address}`)
            const dev = this.device;
            if (!this.isConnected || !dev.isPaired) {
                this.log("not conn")
                return true;
            }
            if (!this.status.isPairedInstanceAddress(packet.address)) {
                this.log('invalid paired address')
                return true;
            }
            if (dev.isPairedDriver)
                return this.handleHostPacket(packet);
            else
                return this.handleVirtualPacket(packet);
        }

        /**
         * Processes the packet received by the host
         * @param packet 
         */
        protected handleHostPacket(packet: JDPacket): boolean {
            return true;
        }

        /**
         * Processes the packet received by the virtual driver
         * @param packet 
         */
        protected handleVirtualPacket(packet: JDPacket): boolean {
            return true;
        }
    }

    //% shim=pxt::programHash
    export function programHash(): number { return 0 }

    //% shim=jacdac::__internalAddDriver
    function __internalAddDriver(driverType: number, deviceClass: number, methods: ((p: Buffer) => void)[]): JacDacDriverStatus {
        return null
    }

    /**
     * Adds a JacDac device driver
     * @param n driver
     */
    export function addDriver(n: JacDacDriver) {
        if (n.status) { // don't add twice
            n.log(`already added`);
            return;
        }

        n.log(`add t${n.driverType} c${n.deviceClass}`)
        n.status = __internalAddDriver(n.driverType, n.deviceClass, [
            (p: Buffer) => n.handlePacket(p)
        ]);
    }

    /**
     * Sends a packet
     * @param pkt jackdack data
     */
    export function sendPacket(pkt: Buffer, deviceAddress: number) {
        control.dmesg(`jd> send ${pkt.length}b to ${deviceAddress}`)
        __internalSendPacket(pkt, deviceAddress);
    }

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
        buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }

        static mk(address: number, flags: number, serialNumber: number, driverClass: number) {
            const buf = control.createBuffer(12);
            buf.setNumber(NumberFormat.UInt8LE, 0, address);
            buf.setNumber(NumberFormat.UInt8LE, 1, 0); // rolling counter
            buf.setNumber(NumberFormat.UInt16LE, 2, flags);
            buf.setNumber(NumberFormat.UInt16LE, 4, serialNumber);
            buf.setNumber(NumberFormat.UInt16LE, 8, driverClass);
            return new JDDevice(buf);
        }

        get driverAddress(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 0);
        }
        get rollingCounter(): number {
            return this.buf.getNumber(NumberFormat.UInt8LE, 1);
        }
        get flags(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 2);
        }
        get serialNumber(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
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
        get isVirtualDriver(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_REMOTE) && !(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the PairedDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in PairedDriver mode.
         **/
        get isPairedDriver(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST) && !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIR);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the HostDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in SnifferDriver mode.
         **/
        get isHostDriver(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_LOCAL) && !(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the BroadcastDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in BroadcastDriver mode.
         **/
        get isBroadcastDriver(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_LOCAL) && !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Used to determine what mode the driver is currently in.
         *
         * This will check to see if the flags field resembles the SnifferDriver mode specified in the DriverType enumeration.
         *
         * @returns true if in SnifferDriver mode.
         **/
        get isSnifferDriver(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_REMOTE) && !!(this.flags & DAL.JD_DEVICE_FLAGS_BROADCAST);
        }

        /**
         * Indicates if the driver is currently paired to another.
         *
         * @returns true if paired
         **/
        get isPaired(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRED);
        }

        /**
         * Indicates if the driver can be currently paired to another.
         *
         * @returns true if pairable
         **/
        get isPairable(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRABLE);
        }

        /**
         * Indicates if the driver is currently in the process of pairing to another.
         *
         * @returns true if pairing
         **/
        get isPairing(): boolean
        {
            return !!(this.flags & DAL.JD_DEVICE_FLAGS_PAIRING);
        }
    }
}
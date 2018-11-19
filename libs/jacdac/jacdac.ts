class JacDacDriver {
    public name: string;
    public device: JacDacDriverStatus;
    public driverType: jacdac.DriverType;
    public deviceClass: number;
    protected supressLog: boolean;

    constructor(name: string, driverType: jacdac.DriverType, deviceClass: number, suppressLog: boolean = false) {
        this.name = name;
        this.driverType = driverType;
        this.deviceClass = deviceClass || jacdac.programHash();
        this.supressLog = suppressLog;
    }

    public log(text: string) {
        if (!this.supressLog)
            console.add(jacdac.consolePriority, `jd>${this.name}>${text}`);
    }

    /**
     * Called by the logic driver when a control packet is addressed to this driver.
     * Return false when the packet wasn't handled here.
     */
    public handleControlPacket(pkt: Buffer): boolean {
        return false
    }

    /**
     * Called by the logic driver when a data packet is addressed to this driver
     * Return false when the packet wasn't handled here.
     */
    public handlePacket(pkt: Buffer): boolean {
        return false
    }

    /**
     * Fill additional driver-specific info on the control packet for this driver.
     **/
    public fillControlPacket(pkt: Buffer): void { }

    /**
     * Called by the logic driver when a new device is connected to the serial bus
     */
    public deviceConnected(): void {
        this.log("dev con");
    }

    /**
     * Called by the logic driver when an existing device is disconnected from the serial bus
     **/
    public deviceRemoved(): void {
        this.log("dev rem");
    }

    /**
     * Sends a pairing packet
     */
    public sendPairing(address: number, flags: number, serialNumber: number, driverClass: number) { 
        this.log("send pairing packet")

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

        protected sendPacket(pkt: Buffer) {
            this.log(`send pkt to ${this.device.driverAddress}`)
            jacdac.sendPacket(pkt, this.device.driverAddress);
        }

        protected canSendPacket(): boolean {
            return this.device.isConnected && this.device.isPaired;
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const cp = new ControlPacket(pkt);
            this.log(`cp from ${cp.serialNumber} at ${cp.address}`)
            if (this.device.isPairedDriver && !this.device.isPaired) {
                this.log("needs pairing");
                if (cp.flags & DAL.CONTROL_JD_FLAGS_PAIRABLE) {
                    this.log(`send pairing`)
                    this.sendPairing(cp.address,
                        DAL.JD_DEVICE_FLAGS_REMOTE
                        | DAL.JD_DEVICE_FLAGS_INITIALISED
                        | DAL.JD_DEVICE_FLAGS_CP_SEEN,
                        cp.serialNumber,
                        cp.driverClass);
                }
            }
            return true;
        }

        public handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            this.log(`rec ${packet.data.length}b from ${packet.address}`)
            if (!this.device.isConnected || !this.device.isPaired) {
                this.log("not conn")
                return true;
            }
            if (!this.device.isPairedInstanceAddress(packet.address)) {
                this.log('invalid paired address')
                return true;
            }
            if (this.device.isPairedDriver)
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
        if (n.device) { // don't add twice
            n.log(`already added`);
            return;
        }

        n.log(`add ${n.driverType} ${n.deviceClass}`)
        n.device = __internalAddDriver(n.driverType, n.deviceClass, [
            (p: Buffer) => n.handleControlPacket(p),
            (p: Buffer) => n.handlePacket(p),
            (p: Buffer) => n.fillControlPacket(p),
            () => n.deviceConnected(),
            () => n.deviceRemoved()])
    }

    /**
     * Sends a packet
     * @param pkt jackdack data
     */
    export function sendPacket(pkt: Buffer, deviceAddress: number) {
        control.dmesg(`jd> send ${pkt.length} bytes to ${deviceAddress}`)
        __internalSendPacket(pkt, deviceAddress);
    }

    export class JDPacket {
        protected buf: Buffer;
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
        private buf: Buffer;
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
}
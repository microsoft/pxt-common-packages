class JacDacDriver {
    public device: JacDacDriverStatus;
    public driverType: jacdac.DriverType;
    public deviceClass: number;

    constructor(driverType: jacdac.DriverType, deviceClass: number) {
        this.driverType = driverType;
        this.deviceClass = deviceClass || jacdac.programHash();
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
    public deviceConnected(): void { }

    /**
     * Called by the logic driver when an existing device is disconnected from the serial bus
     **/
    public deviceRemoved(): void { }
}

namespace jacdac {
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

    export let log: (msg: string) => void = function () { };

    //% shim=pxt::programHash
    export function programHash(): number { return 0 }

    //% shim=jacdac::__internalSendPairingPacket
    function __internalSendPairingPacket(address: uint32, flags: uint32, serialNumber: uint32, driverClass: uint32): void {
    }

    /**
     * Sends a pairing packet
     * @param address 
     * @param flags 
     * @param serialNumber 
     * @param driverClass 
     */
    //%
    export function sendPairing(address: uint32, flags: uint32, serialNumber: uint32, driverClass: uint32): void {
        __internalSendPairingPacket(address, flags, serialNumber, driverClass);
    }


    //% shim=jacdac::__internalAddDriver
    function __internalAddDriver(driverType: number, deviceClass: number, methods: ((p: Buffer) => void)[]): JacDacDriverStatus {
        return null
    }

    /**
     * Adds a JacDac device driver
     * @param n driver
     */
    export function addDriver(n: JacDacDriver) {
        if (n.device) // don't add twice
            return;
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
    //% shim=jacdac::sendPacket
    export function sendPacket(pkt: Buffer, deviceAddress: number) {

    }

    let bus: MessageBusDriver = undefined;
    /**
     * Starts JACDAC and mounts the bus driver
     */
    //%
    export function start() {
        if (!bus) {
            bus = new MessageBusDriver();
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
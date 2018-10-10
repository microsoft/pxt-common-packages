class JacDacDriver {
    public device: JacDacDriverStatus;

    public deviceClass(): number {
        return jacdac.programHash()
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
    export let log: (msg: string) => void = function() { };

    //% shim=pxt::programHash
    export function programHash(): number { return 0 }

    //% shim=jacdac::addNetworkDriver
    function addNetworkDriver(deviceClass: number, methods: ((p: Buffer) => void)[]): JacDacDriverStatus {
        return null
    }

    /**
     * Adds a JacDac device driver
     * @param n driver
     */
    export function addDriver(n: JacDacDriver) {
        if (n.device) // don't add twice
            return;
        n.device = addNetworkDriver(n.deviceClass(), [
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

    export class ControlPacket {
        private buf: Buffer;
        constructor(buf: Buffer) {
            this.buf = buf;
        }
        // TODO parsing
        get address(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
        }
        get serialNumber(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
        }
        get driverClass(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
        }
        get flags(): number {
            return this.buf.getNumber(NumberFormat.UInt32LE, 4);
        }
    }
}
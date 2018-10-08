class JacDacDriver {
    public status: JacDacDriverStatus;

    public deviceClass() {
        return network.programHash()
    }

    /**
     * Called by the logic driver when a control packet is addressed to this driver.
     * Return false when the packet wasn't handled here.
     */
    public handleControlPacket(pkt: Buffer) {
        return false
    }

    /**
     * Called by the logic driver when a data packet is addressed to this driver
     * Return false when the packet wasn't handled here.
     */
    public handlePacket(pkt: Buffer) {
        return false
    }

    /**
     * Fill additional driver-specific info on the control packet for this driver.
     **/
    public fillControlPacket(pkt: Buffer) { }

    /**
     * Called by the logic driver when a new device is connected to the serial bus
     */
    public deviceConnected() { }

    /**
     * Called by the logic driver when an existing device is disconnected from the serial bus
     **/
    public deviceRemoved() { }
}

namespace network {
    //% shim=pxt::programHash
    export function programHash(): int32 { return 0 }

    //% shim=jacdac::addNetworkDriver
    function addNetworkDriver(deviceClass: int32, methods: ((p:Buffer) => void)[]): JacDacDriverStatus { 
        return null
    }

    export function addDriver(deviceClass: int32, n: JacDacDriver) {
        if (n.status)
            return
        n.status = addNetworkDriver(n.deviceClass(), [
            (p: Buffer) => n.handleControlPacket(p),
            (p: Buffer) => n.handlePacket(p),
            (p: Buffer) => n.fillControlPacket(p),
            () => n.deviceConnected(),
            () => n.deviceRemoved()])
    }
}
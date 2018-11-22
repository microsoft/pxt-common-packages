namespace jacdac {
    export class BridgeDriver extends Driver {
        constructor(name: string) {
            super(name, 0, DAL.JD_DRIVER_CLASS_BRIDGE);
            this.supressLog = true; // too verbose
            jacdac.addDriver(this);
        }

        /**
         * Enables this driver as a bridge
         */
        enable() {
            this._proxy.setBridge();
        }
    }

    class LogAllDriver extends BridgeDriver {
        constructor() {
            super("log")
        }

        handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            console.log(`jd>cp ${packet.address}=${packet.driverClass} ${packet.flags}`)
            return true;
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            console.log(`jd>p ${packet.address} ${packet.size}b`)
            return true;
        }
    }

    let _logAllDriver : LogAllDriver;
    /**
     * Show ALL jacdac packets on console
     */
    export function logAllPackets() {
        if (!_logAllDriver)
            _logAllDriver = new LogAllDriver();
        _logAllDriver.enable();
    }
}
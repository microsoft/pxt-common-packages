namespace jacdac {
    export class BridgeDriver extends Driver {
        constructor(name: string) {
            super(name, 0, DAL.JD_DRIVER_CLASS_BRIDGE);
            this.supressLog = true; // too verbose
        }

        start() {
            if (!this.hasProxy()) {
                super.start();
                if (this._proxy) this._proxy.setBridge();
            }
        }
    }

    class LogAllDriver extends BridgeDriver {
        constructor() {
            super("log")
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            if (packet.address == 0) {
                const cp = new ControlPacket(packet.data);
                console.log(`jd>cp ${cp.address}=${cp.driverClass} ${cp.flags}`)
                const data = cp.data;
                if (data.length)
                    console.log(" " + cp.data.toHex());
                return true;
            } else {
                console.log(`jd>p ${packet.address} ${packet.size}b`)
                const data = packet.data;
                if (data.length)
                    console.log(" " + packet.data.toHex());
            }
            return true;
        }
    }

    let _logAllDriver: LogAllDriver;
    /**
     * Show ALL jacdac packets on console
     */
    export function logAllPackets() {
        if (!_logAllDriver) {
            _logAllDriver = new LogAllDriver();
            _logAllDriver.start();
        }
    }
}
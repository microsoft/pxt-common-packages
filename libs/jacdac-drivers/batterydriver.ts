namespace jacdac {
    class BatteryDriver extends Driver {
        private level: () => number;
        constructor(level: () => number) {
            super("bat", DriverType.HostDriver, jacdac.BATTERY_DEVICE_CLASS, 1);
            this.level = level;
            jacdac.addDriver(this);
        }

        protected updateControlPacket() {
            const batteryLevel = this.level();
            this.log(`level ${batteryLevel}`);
            this.controlData.setNumber(NumberFormat.UInt8LE, 0, batteryLevel);
        }
    }

    /**
     * Send battery level over jacdac
     * @param level 
     */
    //%
    export function broadcastBatteryLevel(level: () => number) {
        new BatteryDriver(level);
    }

    class BatterySniffer extends Driver {
        handler: (serialNumber: number, level: number) => void;
        constructor(handler: (serialNumber: number, level: number) => void) {
            super("batmon", DriverType.SnifferDriver, jacdac.BATTERY_DEVICE_CLASS);
            this.handler = handler;
            jacdac.addDriver(this);
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const cp = new ControlPacket(pkt);
            const level = cp.data.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`${cp.serialNumber}: ${level}`);
            this.handler(cp.serialNumber, level);
            return true;
        }
    }

    export function monitorBatteryLevels(handler: (serialNumber: number, level: number) => void) {
        new BatterySniffer(handler);
    }
}
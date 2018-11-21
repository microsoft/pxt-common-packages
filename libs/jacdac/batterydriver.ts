namespace jacdac {
    class BatteryDriver extends Driver {
        private level: () => number;
        constructor(level: () => number) {
            super("bat", DriverType.HostDriver, jacdac.BATTERY_DRIVER_CLASS, 1);
            this.level = level;
            jacdac.addDriver(this);
        }

        protected updateControlPacket() {
            const batteryLevel = this.level();
            this.log(`level ${this.level}`);
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
        constructor() {
            super("bat", DriverType.SnifferDriver, jacdac.BATTERY_DRIVER_CLASS);
            jacdac.addDriver(this);
        }
    }

    let _batterSniffer: BatterySniffer;
    export function monitorBatteryLevels() {
        if (!_batterSniffer)
            _batterSniffer = new BatterySniffer();
    }
}
namespace jacdac {
    /* export class BatteryService extends Service {
        private level: () => number;
        constructor(level: () => number) {
            super("bat", jacdac.BATTERY_DEVICE_CLASS, 1);
            this.level = level;
        }

        protected updateControlPacket() {
            const batteryLevel = this.level();
            this.log(`level ${batteryLevel}`);
            this.controlData.setNumber(NumberFormat.UInt8LE, 0, batteryLevel);
        }
    } */

    class BatterySniffer extends Driver {
        handler: (serialNumber: number, level: number) => void;
        constructor(handler: (serialNumber: number, level: number) => void) {
            super("batmon", DriverType.SnifferDriver, jacdac.BATTERY_DEVICE_CLASS);
            this.handler = handler;
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const cp = new JDControlPacket(pkt);
            const level = cp.data.getNumber(NumberFormat.UInt8LE, 0);
            this.log(`${cp.serialNumber}: ${level}`);
            this.handler(cp.serialNumber, level);
            return true;
        }
    }

    export function monitorBatteryLevels(handler: (serialNumber: number, level: number) => void) {
        new BatterySniffer(handler).start();
    }
}
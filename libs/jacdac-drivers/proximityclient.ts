namespace jacdac {
    //% fixedInstances
    export class ProximityClient extends SensorClient {
        constructor(name: string) {
            super(name, jacdac.PROXIMITY_DEVICE_CLASS);
        }

        /**
         * Gets the distance measure by the sensor. Negative if missing
         */
        get distance(): number {
            const s = this.state;
            if (!s || s.length < 1) return -1;
            return s.getNumber(NumberFormat.Int32LE, 0);
        }
    }

    //% fixedInstance whenUsed block="light sensor client"
    export const proximityClient = new ProximityClient("proxi");
}

namespace jacdac {
    //% fixedInstances
    export class ProximityClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("proxi", jd_class.PROXIMITY, requiredDevice);
        }

        /**
         * Gets the distance measure by the sensor. Negative if missing
         */
        //% blockId=jdproximtitydistance block="jacdac %client distance"
        //% group="Promixity"
        get distance(): number {
            const s = this.state;
            if (!s || s.length < 4) return -1;
            return (s.getNumber(NumberFormat.UInt32LE, 0) / 10);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture
         * @param handler
         */
        //% blockId=jdproximityevent block="jacdac %client on %event"
        //% group="Promixity"
        onEvent(event: JDPromixityEvent, handler: () => void) {
            this.registerEvent(event, handler);
        }

    }

    //% fixedInstance whenUsed block="light sensor client"
    export const proximityClient = new ProximityClient();
}

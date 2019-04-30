namespace jacdac {
    export class ProximityService extends SensorHost {
        constructor(name: string) {
            super(name, jacdac.PROXIMITY_DEVICE_CLASS);
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.Int32LE, 0, input.distance());
            return buf;
        }
    }

    /**
     * Gets the JACDAC proximity host service
     */
    //% fixedInstance whenUsed block="proximity service"
    export const proximityService = new ProximityService("proxi");
}
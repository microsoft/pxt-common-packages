namespace jacdac {
    export class ProximityService extends SensorHost {
        constructor(name: string) {
            super(name, jd_class.PROXIMITY);
            input.onDistanceEvent(PromixityEvent.Close, () => this.raiseHostEvent(PromixityEvent.Close));
            input.onDistanceEvent(PromixityEvent.Far, () => this.raiseHostEvent(PromixityEvent.Far));
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.UInt32LE, 0, (input.distance() * 10) | 0);
            return buf;
        }
    }

    /**
     * Gets the JACDAC proximity host service
     */
    //% fixedInstance whenUsed block="proximity service"
    export const proximityService = new ProximityService("proxi");
}
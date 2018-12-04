namespace jacdac {
    export class LightSensorHostDriver extends jacdac.SensorHostDriver {
        constructor(name: string) {
            super(name, jacdac.LIGHT_SENSOR_DRIVER_CLASS);
            input.lightLevel();
            input.onLightConditionChanged(LightCondition.Bright, () => this.raiseHostEvent(LightCondition.Bright));
            input.onLightConditionChanged(LightCondition.Dark, () => this.raiseHostEvent(LightCondition.Dark));
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(1);
            buf.setNumber(NumberFormat.UInt8LE, 0, input.lightLevel());
            return buf;
        }
    }
}
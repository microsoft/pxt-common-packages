namespace jacdac {
    export class TemperatureHostDriver extends jacdac.SensorHostDriver {
        constructor(name: string) {
            super(name, jacdac.THERMOMETER_DEVICE_CLASS);
            input.onTemperatureConditionChanged(TemperatureCondition.Cold, 10, TemperatureUnit.Celsius, () => this.raiseHostEvent(TemperatureCondition.Cold));
            input.onTemperatureConditionChanged(TemperatureCondition.Cold, 30, TemperatureUnit.Celsius, () => this.raiseHostEvent(TemperatureCondition.Hot));
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.Int32LE, 0, input.temperature(TemperatureUnit.Celsius));
            return buf;
        }
    }
}
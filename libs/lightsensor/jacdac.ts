namespace jacdac {
    export class LightSensorService extends jacdac.SensorService {
        constructor(name: string) {
            super(name, jacdac.LIGHT_SENSOR_DEVICE_CLASS);
            input.onLightConditionChanged(LightCondition.Bright, () => this.raiseHostEvent(LightCondition.Bright));
            input.onLightConditionChanged(LightCondition.Dark, () => this.raiseHostEvent(LightCondition.Dark));
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(1);
            buf.setNumber(NumberFormat.UInt8LE, 0, input.lightLevel());
            return buf;
        }
    }

    //% fixedInstances whenUsed block="light sensor service"
    export const lightSensorService = new LightSensorService("lis");
}
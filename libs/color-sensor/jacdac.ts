namespace jacdac {
    export class ColorSensorService extends SensorHost {
        constructor(name: string) {
            super(name, jacdac.COLOR_SENSOR_DEVICE_CLASS);
        }

        serializeState(): Buffer {
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.UInt32LE, 0 , input.lightColor());
            return buf;
        }
    }

    //% fixedInstance whenUsed block="color sensor service"
    export const colorSensorService = new ColorSensorService("col");
}
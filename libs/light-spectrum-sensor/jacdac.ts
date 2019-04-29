namespace jacdac {
    export class LightSpectrumSensorService extends SensorHost {
        constructor(name: string) {
            super(name, jacdac.LIGHT_SPECTRUM_SENSOR_DEVICE_CLASS);
        }

        serializeState(): Buffer {
            const buf = control.createBuffer(8);
            const sensor = input.lightSpectrumSensor();
            const spectrum = sensor.spectrum();
            buf.setNumber(NumberFormat.UInt32LE, 0 , spectrum.full);
            buf.setNumber(NumberFormat.UInt16LE, 4, spectrum.infrared);
            buf.setNumber(NumberFormat.UInt16LE, 6 , spectrum.visible);
            return buf;
        }
    }

    //% fixedInstance whenUsed block="color sensor service"
    export const lightSpectrumSensorService = new LightSpectrumSensorService("lspec");
}
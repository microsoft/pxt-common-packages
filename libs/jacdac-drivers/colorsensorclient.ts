namespace jacdac {
    //% fixedInstances
    export class ColorSensorClient extends SensorClient {
        constructor(name: string) {
            super(name, jacdac.COLOR_SENSOR_DEVICE_CLASS);
        }

        /**
         * Uses a color sensor to capture the ambient color as a RGB value.
         */
        //% blockId=jdsensor_lightcolor block="%colorsensor light color"
        //% group="Color Sensor"
        lightColor(): number {
            const s = this.state;
            if (!s || s.length < 4) return 0;
            return s.getNumber(NumberFormat.UInt32LE, 0);
        }
    }

    //% fixedInstance whenUsed block="button client"
    export const colorSensorClient = new ColorSensorClient("btn");

}
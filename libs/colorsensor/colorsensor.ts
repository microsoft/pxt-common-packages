namespace sensors {
    export interface ColorSensor {
        /**
         * Reads an RGB color from the sensor
         */
        color(): number;
    }
}

namespace input {
    let _colorSensor: sensors.ColorSensor;

    /**
     * Uses a color sensor to capture the ambient color as a RGB value.
     */
    //% blockId=sensor_lightcolor block="light color"
    export function lightColor(): number {
        if (!_colorSensor)
            _colorSensor = new sensors.TCS34725();
        return _colorSensor.color();
    }
}
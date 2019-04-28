namespace sensors {
    export interface ColorSensor {
        /**
         * Reads an RGB color from the sensor
         */
        color(): number;
    }
}

const enum ColorSensorColor {
    //% block="none"
    None = 0,
    //% block="black"
    Black = 0,
    //% block="blue"
    Blue = 203,
    //% block="green"
    Green = 150,
    //% block="yellow"
    Yellow = 47,
    //% block="red"
    Red = 2,
    //% block="white"
    White = 0,
    //% block="brown"
    Brown = 25
}

namespace input {
    let _colorSensor: sensors.ColorSensor;

    /**
     * Uses a color sensor to capture the ambient color as a RGB value.
     */
    //% blockId=sensor_lightcolor block="light color"
    //% group="Color Sensor"
    export function lightColor(): number {
        if (!_colorSensor)
            _colorSensor = new sensors.TCS34725();
        return _colorSensor.color();
    }

    let _colorDetectors: (() => void)[];
    let _lastColorDetected = ColorSensorColor.None;
    /**
     * Registers code to run when the given color is detected.
     * @param color the color to detect, eg: ColorSensorColor.Blue
     * @param handler the code to run when detected
     */
    //% help=sensors/color-sensor/on-color-detected
    //% block="on color detected %color"
    //% blockId=sensorcolorOnColorDetected
    //% group="Color Sensor"
    export function onColorDetected(color: ColorSensorColor, handler: () => void) {
        if (!_colorSensor)
            _colorSensor = new sensors.TCS34725();
        if (!_colorDetectors) {
            _colorDetectors = [];
            startColorDetector();
        }
        _colorDetectors[color] = handler;
    }

    function mapRgbToColor(col: number): ColorSensorColor {
        const r = ((col >> 16) & 0xff) / 255;
        const g = ((col >> 8) & 0xff) / 255;
        const b = ((col) & 0xff) / 255;

        const cmax = Math.max(r, Math.max(g, b));
        const cmin = Math.min(r, Math.min(g, b));
        const c = cmax - cmin;
        let hue: number;
        if (c == 0) {
            hue = 0;
        } else {
            switch (cmax) {
                case r: {
                    const segment = (g - b) / c;
                    let shift = 0 / 60;       // R° / (360° / hex sides)
                    if (segment < 0) {          // hue > 180, full rotation
                        shift = 360 / 60;         // R° / (360° / hex sides)
                    }
                    hue = segment + shift;
                    break;
                }
                case g: {
                    const segment = (b - r) / c;
                    const shift = 120 / 60;     // G° / (360° / hex sides)
                    hue = segment + shift;
                    break;
                }
                case b: {
                    const segment = (r - g) / c;
                    const shift = 240 / 60;     // B° / (360° / hex sides)
                    hue = segment + shift;
                    break;
                }
            }
        }
        hue = hue * 60; // hue is in [0,6], scale it up

        // Calculate lightness
        let l = (cmax + cmin) / 2;

        // Calculate saturation
        let s = c == 0 ? 0 : c / (1 - Math.abs(2 * l - 1));

        // white/black
        if (hue == 0) {
            return l < 0.1 ? ColorSensorColor.Black
                : l > 0.8 ? ColorSensorColor.White
                    : ColorSensorColor.None;
        }

        // other colors
        // TODO

        // no color
        return ColorSensorColor.None;
    }

    function startColorDetector() {
        const detectors = _colorDetectors;
        control.runInBackground(function () {
            while (_colorDetectors == detectors) {
                const c = _colorSensor.color();
                const cd = mapRgbToColor(c); // map hue to color enum
                if (cd != this._lastColorDetected) {
                    const h = detectors[cd];
                    if (h)
                        h();
                    this._lastColorDetected = cd;
                }
                pause(20);
            }
        })
    }
}
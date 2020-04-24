namespace jacdac {
    //% fixedInstances
    export class ColorSensorClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("cols", jd_class.COLOR_SENSOR, requiredDevice);
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

        /**
         * Returns the hue of the color
         */
        lightHue(): number {
            const c = this.lightColor();
            const h = ColorSensorClient.mapRgbToColor(c);
            console.log(`color ${c} -> ${h}`)
            return h;
        }

        private static mapRgbToColor(col: number): number {
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
            hue = hue / 0.6 * 255; // hue is in [0,6], scale it up
            return hue | 0;
        }
    }

    //% fixedInstance whenUsed block="color sensor"
    export const colorSensorClient = new ColorSensorClient();

}
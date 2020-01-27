/**
 * Well known colors
 */
const enum Colors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFF7F00,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xA033E5,
    //% block=pink
    Pink = 0xFF007F,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

/**
 * Well known color hues
 */
const enum ColorHues {
    //% block=red
    Red = 0,
    //% block=orange
    Orange = 29,
    //% block=yellow
    Yellow = 43,
    //% block=green
    Green = 86,
    //% block=aqua
    Aqua = 125,
    //% block=blue
    Blue = 170,
    //% block=purple
    Purple = 191,
    //% block=magenta
    Magenta = 213,
    //% block=pink
    Pink = 234
}

/**
 * Color manipulation
 */
//% advanced=1
namespace color {
    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% blockId="colorsrgb" block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% help="colors/rgb"
    //% weight=19 blockGap=8
    //% blockHidden=true
    export function rgb(red: number, green: number, blue: number): number {
        return ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
    }

    export function argb(alpha: number, red: number, green: number, blue: number): number {
        return ((alpha & 0xFF) << 24) | ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
    }

    /**
    * Get the RGB value of a known color
    */
    //% blockId=colorscolors block="%color"
    //% help="colors/well-known"
    //% shim=TD_ID
    //% weight=20 blockGap=8
    //% blockHidden=true
    export function wellKnown(color: Colors): number {
        return color;
    }

    /**
     * Convert an HSV (hue, saturation, value) color to RGB
     * @param hue value of the hue channel between 0 and 255. eg: 255
     * @param sat value of the saturation channel between 0 and 255. eg: 255
     * @param val value of the value channel between 0 and 255. eg: 255
     */

    //% blockId="colorshsv" block="hue %hue|sat %sat|val %val"
    //% hue.min=0 hue.max=255 sat.min=0 sat.max=255 val.min=0 val.max=255
    //% help="colors/hsv"
    //% weight=17
    //% blockHidden=true
    export function hsv(hue: number, sat: number = 255, val: number = 255): number {
        let h = (hue % 255) >> 0;
        if (h < 0) h += 255;
        // scale down to 0..192
        h = (h * 192 / 255) >> 0;

        //reference: based on FastLED's hsv2rgb rainbow algorithm [https://github.com/FastLED/FastLED](MIT)
        const invsat = 255 - sat;
        const brightness_floor = ((val * invsat) / 255) >> 0;
        const color_amplitude = val - brightness_floor;
        const section = (h / 0x40) >> 0; // [0..2]
        const offset = (h % 0x40) >> 0; // [0..63]

        const rampup = offset;
        const rampdown = (0x40 - 1) - offset;

        const rampup_amp_adj = ((rampup * color_amplitude) / (255 / 4)) >> 0;
        const rampdown_amp_adj = ((rampdown * color_amplitude) / (255 / 4)) >> 0;

        const rampup_adj_with_floor = (rampup_amp_adj + brightness_floor);
        const rampdown_adj_with_floor = (rampdown_amp_adj + brightness_floor);

        let r: number;
        let g: number;
        let b: number;
        if (section) {
            if (section == 1) {
                // section 1: 0x40..0x7F
                r = brightness_floor;
                g = rampdown_adj_with_floor;
                b = rampup_adj_with_floor;
            } else {
                // section 2; 0x80..0xBF
                r = rampup_adj_with_floor;
                g = brightness_floor;
                b = rampdown_adj_with_floor;
            }
        } else {
            // section 0: 0x00..0x3F
            r = rampdown_adj_with_floor;
            g = rampup_adj_with_floor;
            b = brightness_floor;
        }
        return rgb(r, g, b);
    }

    /**
     * Fade the color by the brightness
     * @param color color to fade
     * @param brightness the amount of brightness to apply to the color, eg: 128
     */
    //% blockId="colorsfade" block="fade %color=neopixel_colors|by %brightness"
    //% brightness.min=0 brightness.max=255
    //% help="light/fade"
    //% group="Color" weight=18 blockGap=8
    //% blockHidden=true
    export function fade(color: number, brightness: number): number {
        brightness = Math.max(0, Math.min(255, brightness >> 0));
        if (brightness < 255) {
            let red = unpackR(color);
            let green = unpackG(color);
            let blue = unpackB(color);

            red = (red * brightness) >> 8;
            green = (green * brightness) >> 8;
            blue = (blue * brightness) >> 8;

            color = rgb(red, green, blue);
        }
        return color;
    }

    export function blend(color: number, alpha: number, otherColor: number) {
        alpha = Math.max(0, Math.min(0xff, alpha | 0));
        const malpha = 0xff - alpha;
        const r = (unpackR(color) * malpha + unpackR(otherColor) * alpha) >> 8;
        const g = (unpackG(color) * malpha + unpackG(otherColor) * alpha) >> 8;
        const b = (unpackB(color) * malpha + unpackB(otherColor) * alpha) >> 8;
        return rgb(r, g, b);
    }

    export function gradient(startColor: number, endColor: number, steps: number): ColorBuffer {
        steps = Math.max(2, steps | 0);
        const b = new ColorBuffer(steps);
        b.setColor(0, startColor);
        b.setColor(b.length - 1, endColor);
        for (let i = 1; i < steps - 1; ++i) {
            const alpha = Math.idiv(0xff * i, steps);
            const c = blend(startColor, alpha, endColor);
            b.setColor(i, c);
        }
        return b;
    }

    export function unpackR(rgb: number): number {
        return (rgb >> 16) & 0xFF;
    }
    export function unpackG(rgb: number): number {
        return (rgb >> 8) & 0xFF;
    }
    export function unpackB(rgb: number): number {
        return (rgb >> 0) & 0xFF;
    }

    export function parseColor(color: string): number {
        switch (color) {
            case "RED":
            case "red":
                return Colors.Red;
            case "GREEN":
            case "green":
                return Colors.Green;
            case "BLUE":
            case "blue":
                return Colors.Blue;
            case "WHITE":
            case "white":
                return Colors.White;
            case "ORANGE":
            case "orange":
                return Colors.Orange;
            case "PURPLE":
            case "purple":
                return Colors.Purple;
            case "YELLOW":
            case "yellow":
                return Colors.Yellow;
            case "PINK":
            case "pink":
                return Colors.Pink;
            default:
                return parseInt(color) || 0;
        }
    }
}
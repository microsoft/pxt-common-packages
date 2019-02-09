/**
 * Well known colors for a NeoPixel strip
 */
enum PixelColors {
    //% block=red blockIdentity=pixel.colors
    Red = 0xFF0000,
    //% block=orange blockIdentity=pixel.colors
    Orange = 0xFF7F00,
    //% block=yellow blockIdentity=pixel.colors
    Yellow = 0xFFFF00,
    //% block=green blockIdentity=pixel.colors
    Green = 0x00FF00,
    //% block=blue blockIdentity=pixel.colors
    Blue = 0x0000FF,
    //% block=indigo blockIdentity=pixel.colors
    Indigo = 0x4b0082,
    //% block=violet blockIdentity=pixel.colors
    Violet = 0x8a2be2,
    //% block=purple blockIdentity=pixel.colors
    Purple = 0xA033E5,
    //% block=pink blockIdentity=pixel.colors
    Pink = 0xFF007F,
    //% block=white blockIdentity=pixel.colors
    White = 0xFFFFFF,
    //% block=black  blockIdentity=pixel.colors
    Black = 0x000000
}

/**
 * Functions to operate on-board color LED (if any).
 */
//% weight=100 color="#0078d7" icon="\uf0eb"
namespace pixel {
    let _strip: light.LightStrip;

    function init(): boolean {
        if (_strip) return true;

        const data = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_DATA);
        const clk = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_CLOCK);
        if (data && clk) {
            control.dmesg(`pixel: found data & clk`);
            _strip = light.createDotStarStrip(data, clk, 1);
            _strip.setBrightness(96);
            return true;
        }

        const neo = pins.pinByCfg(DAL.CFG_PIN_NEOPIXEL);
        if (neo) {
            _strip = light.createNeoPixelStrip(neo, 1, NeoPixelMode.RGB);
            return true;
        }

        // not configured
        control.dmesg("pixel not configured");
        return false;
    }

    /**
     * Set the on-board pixel to a given color.
     * @param color RGB color of the LED
     */
    //% blockId="pixel_set_pixel" block="set pixel color %rgb=colorNumberPicker"
    //% weight=99
    //% blockGap=8
    //% parts="pixel"
    export function setColor(color: number): void {
        if (!init()) return;
        _strip.setAll(color);
    }

    /**
     * Get the RGB value of a known color
    */
    //% blockId=pixel_colors block="%color"
    //% weight=20
    //% blockGap=8
    //% shim=TD_ID
    export function colors(color: PixelColors): number {
        return color;
    }

    /**
     * Set the brightness of the neopixel. This flag only applies to future operations.
     * @param brightness a measure of LED brightness in 0-255. eg: 20
     */
    //% blockId="pixel_set_brightness" block="set brightness %brightness"
    //% weight=98
    //% parts="pixel"
    //% brightness.min=0 brightness.max=255
    export function setBrightness(brightness: number): void {
        if (!init()) return;
        _strip.setBrightness(brightness);
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% blockId="pixel_rgb" block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% weight=19
    //% blockGap=8
    export function rgb(red: number, green: number, blue: number): number {
        return light.rgb(red, green, blue);
    }

    /**
     * Fade the color by the brightness
     * @param color color to fade
     * @param brightness the amount of brightness to apply to the color, eg: 128
     */
    //% blockId="pixel_fade" block="fade %color=pixel_colors|by %brightness"
    //% brightness.min=0 brightness.max=255
    //% weight=18
    //% blockGap=8
    export function fade(color: number, brightness: number): number {
        return light.fade(color, brightness);
    }

    /**
     * Convert an HSV (hue, saturation, value) color to RGB
     * @param hue value of the hue channel between 0 and 255. eg: 255
     * @param sat value of the saturation channel between 0 and 255. eg: 255
     * @param val value of the value channel between 0 and 255. eg: 255
     */

    //% blockId="pixel_hsv" block="hue %hue|sat %sat|val %val"
    //% hue.min=0 hue.max=255 sat.min=0 sat.max=255 val.min=0 val.max=255
    //% weight=17
    export function hsv(hue: number, sat: number, val: number): number {
        return light.hsv(hue, sat, val);
    }
}
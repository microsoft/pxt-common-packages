
namespace light {
    /**
     * This block is deprecated, use ``light.createStrip`` instead.
     */
    //% blockId="neopixel_create" block="create strip|pin %pin|pixels %numleds|mode %mode"
    //% help="light/create-neo-pixel-strip"
    //% trackArgs=0,2
    //% parts="neopixel"
    //% weight=100 deprecated=true blockHidden=true
    export function createNeoPixelStrip(
        pin: DigitalPin = null,
        numleds: number = 10,
        mode?: NeoPixelMode
    ): NeoPixelStrip {
        if (!mode)
            mode = NeoPixelMode.RGB

        const strip = new NeoPixelStrip();
        strip._mode = mode;
        strip._length = Math.max(0, numleds);
        strip._start = 0;
        strip._pin = pin ? pin : defaultPin();
        strip._pin.digitalWrite(false);
        strip._barGraphHigh = 0;
        strip._barGraphHighLast = 0;
        strip.setBrightness(20)
        return strip;
    }

    /**
     * Create a new programmable light strip.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 24,30,60,64
     * @param mode the light encoding mode for different LED strips, eg: NeoPixelMode.RGB_GRB
     */
    //% blockId="neopixel_create_strip" block="create strip|on %pin|with %numleds|pixels"
    //% help="light/create-strip"
    //% trackArgs=0,2
    //% parts="neopixel"
    //% subcategory="External" weight=100
    export function createStrip(
        pin: DigitalPin = null,
        numleds: number = 10,
        mode: NeoPixelMode = NeoPixelMode.RGB
    ): NeoPixelStrip {
        return light.createNeoPixelStrip(pin, numleds, mode);
    }
}
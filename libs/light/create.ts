
namespace light {
    /**
     * Create a new programmable light strip.
     * @param pin the pin where the strip is connected.
     * @param numleds number of leds in the strip, eg: 30
     * @param mode the light encoding mode for different LED strips, eg: NeoPixelMode.RGB_GRB
     */
    //% blockId="neopixel_create_strip" block="create WS2812 strip on %pin with %numleds pixels"
    //% help="light/create-strip"
    //% weight=100
    //% blockSetVariable=strip
    //% trackArgs=0,2
    //% parts="neopixel"
    //% advanced=true
    export function createStrip(
        pin: DigitalInOutPin = null,
        numleds: number = 30,
        mode: NeoPixelMode = NeoPixelMode.RGB
    ): NeoPixelStrip {
        return light.createNeoPixelStrip(pin, numleds, mode);
    }

    /**
     * Creates a strip of colored LEDs (APA102)
     */
    //% blockId="light_create_dotstar" block="create APA102 strip|data %data|clock %clk|with %numleds pixels"
    //% help="light/create-apa102-strip"
    //% trackArgs=0,1,2
    //% parts="dotstar"
    //% weight=100 blockSetVariable=strip
    //% advanced=true
    export function createAPA102Strip(
        dataPin: DigitalInOutPin,
        clkPin: DigitalInOutPin,
        numleds: number): NeoPixelStrip {
        const strip = new NeoPixelStrip();
        strip._mode = NeoPixelMode.APA102;
        strip._length = Math.max(0, numleds | 0);
        strip._dataPin = dataPin;
        strip._clkPin = clkPin;
        return strip;
    }
}
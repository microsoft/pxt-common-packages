
namespace light {
    /**
     * Create a new programmable light strip.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 30
     * @param mode the light encoding mode for different LED strips, eg: NeoPixelMode.RGB_GRB
     */
    //% blockId="neopixel_create_strip" block="create strip on %pin with %numleds pixels"
    //% help="light/create-strip"
    //% weight=100
    //% blockSetVariable=strip
    //% trackArgs=0,2
    //% parts="neopixel"
    export function createStrip(
        pin: DigitalInOutPin = null,
        numleds: number = 30,
        mode: NeoPixelMode = NeoPixelMode.RGB
    ): NeoPixelStrip {
        return light.createNeoPixelStrip(pin, numleds, mode);
    }
}
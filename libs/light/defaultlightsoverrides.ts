namespace light {
    /**
     * Create a range of pixels.
     * @param start offset in the NeoPixel strip to start the range
     * @param length number of pixels in the range, eg: 4
     */
    //% blockId="lightstrip_range" block="range from %start|with %length|pixels"
    //% weight=1
    export function range(start: number, length: number): NeoPixelStrip {
        return pixels.range(start, length);
    }

    /**
     * Sets the number of LEDS on the default light strip
     */
    //% blockId=lightds_setlength block="set pixels length to %numleds pixels"
    //% numleds.defl=30
    //% numleds.shadow=lightLengthPicker
    //% weight=0
    export function setLength(numleds: number) {
        light.pixels.setLength(numleds);
    }

    /**
     * Sets the type of RGB light on the default strip
     */
    //% blockId=lightds_setmode block="set default strip mode to %mode"
    //% weight=0
    export function setMode(mode: NeoPixelMode) {
        light.pixels.setMode(mode);
    }
}
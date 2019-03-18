namespace controller {
    /**
     * Read the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
     */
    //% help=input/light-level
    //% blockId=device_get_light_level block="light level"
    //% parts="lightsensor"
    //% weight=30 blockGap=8
    export function lightLevel(): number {
        return input.lightLevel();
    }
}
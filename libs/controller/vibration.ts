namespace controller {
    /**
     * Vibrates the controller for the given duration (in milli seconds)
     * @param millis 
     */
    //% blockId=ctrlvibrate block="vibrate $millis ms"
    //% millis.shadow=timePicker
    //% group="Extras"
    export function vibrate(millis: number) {
        controller.__internal.vibrate(millis);
    }
}
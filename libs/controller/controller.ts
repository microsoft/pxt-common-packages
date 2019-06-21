namespace controller {
    /**
     * Configures the timing of the on button repeat event for all of the controller buttons
     * @param delay number of milliseconds from when the button is pressed to when the repeat event starts firing, eg: 500
     * @param interval minimum number of milliseconds between calls to the button repeat event, eg: 30
     */
    //% blockId=repeatDefaultDelayInterval block="set button repeat delay $delay ms interval $interval ms"
    //% weight=10
    //% group="Single Player"
    export function configureRepeatEventDefaults(delay: number, interval: number) {
        controller.setRepeatDefault(delay, interval);
    }
}
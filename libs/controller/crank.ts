namespace controller {
    /**
     * Gets the current position of the crank.
     */
    //% blockId=controller_crank_position block="crank position"
    //% weight=29 blockGap=8
    //% group="Extras"
    export function crankPosition(): number {
        return controller.__internal.crankPosition();
    }

    /**
     * Configures the pins used by the crank
     * @param pinA 
     * @param pinB 
     */
    //% blockId=controller_crank_setpins block="set crank pinA $pinA pin B $pinB"
    //% weight=28 blockGap=8
    //% group="Extras"
    export function setCrankPins(pinA: DigitalInOutPin, pinB: DigitalInOutPin) {
        controller.__internal.setCrankPins(pinA, pinB);
    }
}

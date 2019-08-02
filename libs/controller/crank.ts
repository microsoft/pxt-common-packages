namespace controller {
    let crankEncoder: RotaryEncoder;
    /**
     * Gets the current position of the crank.
     */
    //% blockId=controller_crank_position block="crank position"
    //% weight=29 blockGap=8
    //% group="Extras"
    export function crankPosition(): number {
        const crank = crankEncoder || encoders.defaultEncoder;
        return crank ? crank.position() : 0;
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
        crankEncoder = encoders.createRotaryEncoder(pinA, pinB);
    }
}

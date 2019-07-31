namespace controller {
    /**
     * Shows an animation on the controller lights
     * @param animation 
     * @param duration 
     */
    //% blockId=controller_crank_position block="crank position"
    //% weight=29 blockGap=8
    //% group="Extras"
    export function crankPosition(): number {
        const crank = encoders.defaultEncoder;
        return crank ? crank.position() : 0;
    }
}

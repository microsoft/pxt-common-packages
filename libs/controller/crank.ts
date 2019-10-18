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
}

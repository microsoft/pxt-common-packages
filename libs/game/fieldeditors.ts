namespace __internal {

    /**
     * A speed picker
     * @param speed the speed, eg: 50
     */
    //% blockId=spriteSpeedPicker block="%speed" shim=TD_ID
    //% speed.fieldEditor="speed" colorSecondary="#FFFFFF"
    //% weight=0 blockHidden=1 
    //% speed.fieldOptions.decompileLiterals=1
    //% speed.fieldOptions.format="{0}pix/s"
    export function __spriteSpeedPicker(speed: number): number {
        return speed;
    }

    /**
     * A sprite acceleration picker
     * @param acceleration the acceleration in pixel/sec^2
     */
    //% blockId=spriteAccPicker block="%acceleration" shim=TD_ID
    //% speed.fieldEditor="speed" colorSecondary="#FFFFFF"
    //% weight=0 blockHidden=1 
    //% speed.fieldOptions.decompileLiterals=1
    //% speed.fieldOptions.format="{0}pix/s²"
    export function __accSpeedPicker(acceleration: number): number {
        return acceleration;
    }
}
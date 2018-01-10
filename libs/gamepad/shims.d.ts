// Auto-generated. Do not edit.
declare namespace gamepad {

    /** 
     * Sets the button state to down
     */
    //% block=joystickSetButton block="set button %index|%down"
    //% index.min=0 index.max=127
    //% down.fieldeditor=toggleupdown shim=gamepad::setButton
    function setButton(index: int32, down: boolean): void;

    /**
     * Sets the current move on the gamepad
     **/
    //% block=joystickMove block="move %index|x %x|y %y"
    //% index.min=0 index.max=1 shim=gamepad::move
    function move(index: int32, x: int32, y: int32): void;

    /** 
     * Sets the throttle state
     */
    //% block=joystickSetThrottle block="set throttle %index|%value"
    //% index.min=0 index.max=1 shim=gamepad::setThrottle
    function setThrottle(index: int32, value: int32): void;
}

// Auto-generated. Do not edit. Really.

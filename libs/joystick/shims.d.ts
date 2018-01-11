// Auto-generated. Do not edit.
declare namespace joystick {

    /** 
     * Sets the button state to down
     */
    //% help=gamepad/set-button
    //% blockId=joystickSetButton block="set gamepad button %index|%down"
    //% index.min=0 index.max=127
    //% down.fieldEditor=toggleupdown
    //% shim=joystick::setButton
    function setButton(index: int32, down: boolean): void;

    /**
     * Sets the current move on the gamepad
     **/
    //% help=gamepad/move
    //% blockId=joystickMove block="gamepad move %index|x %x|y %y"
    //% index.min=0 index.max=1 shim=joystick::move
    function move(index: int32, x: int32, y: int32): void;

    /** 
     * Sets the throttle state
     */
    //% gamepad/set-throttle
    //% blockId=joystickSetThrottle block="set gamepad throttle %index|%value"
    //% index.min=0 index.max=31 shim=joystick::setThrottle
    function setThrottle(index: int32, value: int32): void;
}

// Auto-generated. Do not edit. Really.

enum StandardGamepadButton {
    //% blockIdentity=gamepad.standardButton enumval=0
    B = 0,
    //% blockIdentity=gamepad.standardButton enumval=1
    A = 1,
    //% blockIdentity=gamepad.standardButton enumval=2
    Y = 2,
    //% blockIdentity=gamepad.standardButton enumval=3
    X = 3,
    //% block="left bumper"
    //% blockIdentity=gamepad.standardButton enumval=4
    LeftBumper = 4,
    //% block="right bumper"
    //% blockIdentity=gamepad.standardButton enumval=5
    RightBumer = 5,
    //% block="left trigger"
    //% blockIdentity=gamepad.standardButton enumval=6
    LeftTrigger = 6,
    //% block="right trigger"
    //% blockIdentity=gamepad.standardButton enumval=7
    RightTrigger = 7,
    //% block="select"
    //% blockIdentity=gamepad.standardButton enumval=8
    Select = 8,
    //% block="start"
    //% blockIdentity=gamepad.standardButton enumval=9
    Start = 9,
    //% block="left stick"
    //% blockIdentity=gamepad.standardButton enumval=10
    LeftStick = 10,
    //% block="right stick"
    //% blockIdentity=gamepad.standardButton enumval=11
    RightStick = 11,
    //% block="up"
    //% blockIdentity=gamepad.standardButton enumval=12
    Up = 12,
    //% block="down"
    //% blockIdentity=gamepad.standardButton enumval=13
    Down = 13,
    //% block="light"
    //% blockIdentity=gamepad.standardButton enumval=14
    Left = 14,
    //% block="right"
    //% blockIdentity=gamepad.standardButton enumval=15
    Right = 15
}

//% icon="\uf11b" color="#777777"
namespace gamepad {
    /**
     * Maps to a standard layout button to the button index
     * @param button the name of the button
     */
    //% blockId=joystickStandardButton block="%button"
    //% shim=TD_ID    
    export function standardButton(button: StandardGamepadButton): number {
        return button;
    }
}
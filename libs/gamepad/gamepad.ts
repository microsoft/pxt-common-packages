enum GamepadButton {
    //% blockIdentity=gamepad.button enumval=0
    B = 0,
    //% blockIdentity=gamepad.button enumval=1
    A = 1,
    //% blockIdentity=gamepad.button enumval=2
    Y = 2,
    //% blockIdentity=gamepad.button enumval=3
    X = 3,
    //% block="left bumper"
    //% blockIdentity=gamepad.button enumval=4
    LeftBumper = 4,
    //% block="right bumper"
    //% blockIdentity=gamepad.button enumval=5
    RightBumer = 5,
    //% block="left trigger"
    //% blockIdentity=gamepad.button enumval=6
    LeftTrigger = 6,
    //% block="right trigger"
    //% blockIdentity=gamepad.button enumval=7
    RightTrigger = 7,
    //% block="select"
    //% blockIdentity=gamepad.button enumval=8
    Select = 8,
    //% block="start"
    //% blockIdentity=gamepad.button enumval=9
    Start = 9,
    //% block="left stick"
    //% blockIdentity=gamepad.button enumval=10
    LeftStick = 10,
    //% block="right stick"
    //% blockIdentity=gamepad.button enumval=11
    RightStick = 11,
    //% block="up"
    //% blockIdentity=gamepad.button enumval=12
    Up = 12,
    //% block="down"
    //% blockIdentity=gamepad.button enumval=13
    Down = 13,
    //% block="left"
    //% blockIdentity=gamepad.button enumval=14
    Left = 14,
    //% block="right"
    //% blockIdentity=gamepad.button enumval=15
    Right = 15
}

//% icon="\uf11b" color="#303030"
namespace gamepad {
    /**
     * Maps to a standard layout button to the button index
     * @param button the name of the button
     */
    //% blockId=joystickStandardButton block="%button"
    //% shim=TD_ID blockHidden=1
    export function button(button: GamepadButton): number {
        return button;
    }
}
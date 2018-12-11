namespace jacdac {
    // drivers
    export const JD_DEVICE_CLASS_MAKECODE_START = 2000;
    export const LOGGER_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 1;
    export const BATTERY_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 2;
    export const ACCELEROMETER_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 3;
    export const BUTTON_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 4;
    export const TOUCHBUTTON_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 5;
    export const LIGHT_SENSOR_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 6;
    export const MICROPHONE_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 7;
    export const THERMOMETER_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 8;
    export const SWITCH_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 9;
    export const PIXEL_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 10;
    export const HAPTIC_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 11;
    export const LIGHT_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 12;
    export const KEYBOARD_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 13;
    export const MOUSE_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 14;
    export const GAMEPAD_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 15;
    export const GAMELOBBY_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 100;
    export const GAMEENGINE_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 101;
    export const CONTROLLER_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 102;

    // events
    export const JD_MESSAGE_BUS_ID = JD_DEVICE_CLASS_MAKECODE_START;
    export const JD_DRIVER_EVT_FILL_CONTROL_PACKET = JD_DEVICE_CLASS_MAKECODE_START + 1;

    export const BUTTON_EVENTS = [
        DAL.DEVICE_BUTTON_EVT_CLICK,
        DAL.DEVICE_BUTTON_EVT_DOWN,
        DAL.DEVICE_BUTTON_EVT_UP,
        DAL.DEVICE_BUTTON_EVT_LONG_CLICK
    ];
}

enum JDLightCommand {
    None,
    SetAll,
    SetBrightness,
    Rainbow,
    RunningLights,
    ColorWipe,
    Comet,
    TheaterChase,
    Sparkle    
}

enum JDLightAnimation {
    //% block="rainbow"
    Rainbow =JDLightCommand.Rainbow,
    //% block="running lights"
    RunningLights = JDLightCommand.RunningLights,
    //% block="color wipe"
    ColorWipe = JDLightCommand.ColorWipe,
    //% block="comet"
    Comet = JDLightCommand.Comet,
    //% block="theater chase"
    TheaterChase = JDLightCommand.TheaterChase,
    //% block="sparkle"
    Sparkle = JDLightCommand.Sparkle
}

enum JDKeyboardCommand {
    None,
    Type,
    Key,
    MediaKey,
    FunctionKey
}

enum JDMouseCommand {
    None,
    Button,
    Move,
    TurnWheel
}

enum JDGamepadCommand {
    None,
    Button,
    Move,
    Throttle
}
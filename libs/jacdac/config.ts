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
    export const MUSIC_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 16;
    export const BUFFER_TABLE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 17;
        
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

const enum JDLightCommand {
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

const enum JDLightAnimation {
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

const enum JDKeyboardCommand {
    None,
    Type,
    Key,
    MediaKey,
    FunctionKey
}

const enum JDMouseCommand {
    None,
    Button,
    Move,
    TurnWheel
}

const enum JDGamepadCommand {
    None,
    Button,
    Move,
    Throttle
}

const enum JDMusicCommand {
    None,
    PlayTone
}

const enum JDGesture {
    /**
     * Raised when shaken
     */
    //% block=shake
    Shake = DAL.ACCELEROMETER_EVT_SHAKE,
    /**
     * Raised when the device tilts up
     */
    //% block="tilt up"
    TiltUp = DAL.ACCELEROMETER_EVT_TILT_UP,
    /**
     * Raised when the device tilts down
     */
    //% block="tilt down"
    TiltDown = DAL.ACCELEROMETER_EVT_TILT_DOWN,
    /**
     * Raised when the screen is pointing left
     */
    //% block="tilt left"
    TiltLeft = DAL.ACCELEROMETER_EVT_TILT_LEFT,
    /**
     * Raised when the screen is pointing right
     */
    //% block="tilt right"
    TiltRight = DAL.ACCELEROMETER_EVT_TILT_RIGHT,
    /**
     * Raised when the screen faces up
     */
    //% block="face up"
    FaceUp = DAL.ACCELEROMETER_EVT_FACE_UP,
    /**
     * Raised when the screen is pointing up and the board is horizontal
     */
    //% block="face down"
    FaceDown = DAL.ACCELEROMETER_EVT_FACE_DOWN,
    /**
     * Raised when the board is falling!
     */
    //% block="free fall"
    FreeFall = DAL.ACCELEROMETER_EVT_FREEFALL,
}

const enum JDDimension {
    //% block=x
    X = 0,
    //% block=y
    Y = 1,
    //% block=z
    Z = 2,
    //% block=strength
    Strength = 3
}

const enum JDButtonEvent {
    //% block="click"
    Click = DAL.DEVICE_BUTTON_EVT_CLICK,
    //% block="long click"
    LongClick = DAL.DEVICE_BUTTON_EVT_LONG_CLICK,
    //% block="up"
    Up = DAL.DEVICE_BUTTON_EVT_UP,
    //% block="down"
    Down = DAL.DEVICE_BUTTON_EVT_DOWN
}

const enum JDSwitchDirection {
    //% block="left"
    Left = DAL.DEVICE_BUTTON_EVT_UP,
    //% block="right"
    Right = DAL.DEVICE_BUTTON_EVT_DOWN,
}


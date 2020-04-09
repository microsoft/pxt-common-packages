namespace jd_class {
    export const CTRL = 0x00000000;
    export const LOGGER = 0x12dc1fca;
    export const BATTERY = 0x1d2a2acd;
    export const ACCELEROMETER = 0x1f140409;
    export const BUTTON = 0x1473a263;
    export const TOUCHBUTTON = 0x130cf5be;
    export const LIGHT_SENSOR = 0x15e7a0ff;
    export const MICROPHONE = 0x1a5c5866;
    export const THERMOMETER = 0x1421bac7;
    export const SWITCH = 0x14218172;
    export const PIXEL = 0x1768fbbf;
    export const HAPTIC = 0x116b14a3;
    export const LIGHT = 0x126f00e0;
    export const KEYBOARD = 0x1ae4812d;
    export const MOUSE = 0x14bc97bf;
    export const GAMEPAD = 0x100527e8;
    export const MUSIC = 0x1b57b1d7;
    export const SERVO = 0x12fc9103;
    export const CONTROLLER = 0x188ae4b8;
    export const LCD = 0x18d5284c;
    export const MESSAGE_BUS = 0x115cabf5;
    export const COLOR_SENSOR = 0x14d6dda2;
    export const LIGHT_SPECTRUM_SENSOR = 0x16fa0c0d;
    export const PROXIMITY = 0x14c1791b;
    export const TOUCH_BUTTONS = 0x1acb49d5;
    export const SERVOS = 0x182988d8;
    export const ROTARY_ENCODER = 0x10fa29c9;
    export const DEVICE_NAME_SERVICE = 0x117729bd;
    export const PWM_LIGHT = 0x1fb57453;
    // to generate a new class number, head to https://microsoft.github.io/uf2/patcher/
    // click link at the bottom and replace first digit with '1'
}

namespace jacdac {
    // common logging level for jacdac services
    export let consolePriority = ConsolePriority.Debug;

    export function toHex(n: number): string {
        const hexBuf = control.createBuffer(4);
        hexBuf.setNumber(NumberFormat.UInt32LE, 0, n);
        return hexBuf.toHex();
    }
    export function toHex16(n: number): string {
        const hexBuf = control.createBuffer(2);
        hexBuf.setNumber(NumberFormat.UInt16LE, 0, n);
        return hexBuf.toHex();
    }
    export function toHex8(n: number): string {
        const hexBuf = control.createBuffer(1);
        hexBuf.setNumber(NumberFormat.UInt8LE, 0, n);
        return hexBuf.toHex();
    }

    // events are send with this device ID
    export const JD_MESSAGE_BUS_ID = 2000;

    export const BUTTON_EVENTS: number[] = [
        DAL.DEVICE_BUTTON_EVT_CLICK,
        DAL.DEVICE_BUTTON_EVT_LONG_CLICK,
        DAL.DEVICE_BUTTON_EVT_DOWN,
        DAL.DEVICE_BUTTON_EVT_UP
    ];
}

const enum JDLightReg {
    LightType = 0x80,
    NumPixels = 0x81,
    Duration = 0x82,
    Color = 0x83,
}

const enum JDLightCommand {
    StartAnimation = 0x80,
}

enum JDLightAnimation {
    //% block="rainbow"
    Rainbow = 2,
    //% block="running lights"
    RunningLights = 3,
    //% block="color wipe"
    ColorWipe = 4,
    //% block="comet"
    Comet = 5,
    //% block="theater chase"
    TheaterChase = 6,
    //% block="sparkle"
    Sparkle = 7
}

const enum JDKeyboardCommand {
    Type = 0x80,
    Key = 0x81,
    MediaKey = 0x82,
    FunctionKey = 0x83,
}

const enum JDMouseCommand {
    Button = 0x80,
    Move = 0x81,
    TurnWheel = 0x82,
}

const enum JDGamepadCommand {
    Button = 0x80,
    Move = 0x81,
    Throttle = 0x82,
}

const enum JDMusicCommand {
    PlayTone = 0x80,
}

const enum JDConsoleCommand {
    MessageDbg = 0x80,
    SetMinPriority = 0x90,
}

const enum JDConsolePriority {
    Debug = 0,
    Log = 1,
    Warning = 2,
    Error = 3,
    Silent = 4
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
    /**
     * Raised when a 3G shock is detected
     */
    //% block="3g"
    ThreeG = DAL.ACCELEROMETER_EVT_3G,
    /**
     * Raised when a 6G shock is detected
     */
    //% block="6g"
    SixG = DAL.ACCELEROMETER_EVT_6G,
    /**
     * Raised when a 8G shock is detected
     */
    //% block="8g"
    EightG = DAL.ACCELEROMETER_EVT_8G,
    /**
     * Raised when a 2g move (or step) is detected
     */
    //% block="2g (step)"
    TwoG = DAL.ACCELEROMETER_EVT_2G,
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

const enum JDControllerCommand {
    ClientButtons = 1,
    ControlServer = 2,
    ControlClient = 3
}

const enum JDControllerButton {
    A = 5,
    B = 6,
    Left = 1,
    Up = 2,
    Right = 3,
    Down = 4,
    Menu = 7
}

const enum JDLCDFlags {
    None,
    Display = 1 << 0,
    Blink = 1 << 1,
    Cursor = 1 << 2
}

const enum JDLightSpectrumRange {
    Full = 10,
    Infrared = 20,
    Visible = 40
}

const enum JDLightCondition {
    //% block="dark"
    Dark = DAL.SENSOR_THRESHOLD_LOW,
    //% block="bright"
    Bright = DAL.SENSOR_THRESHOLD_HIGH
}

const enum JDLightSpectrumEvent {
    FullBright = JDLightSpectrumRange.Full | DAL.LEVEL_THRESHOLD_HIGH,
    FullDark = JDLightSpectrumRange.Full | DAL.LEVEL_THRESHOLD_LOW,
    InfraredBright = JDLightSpectrumRange.Infrared | DAL.LEVEL_THRESHOLD_HIGH,
    InfraredDark = JDLightSpectrumRange.Infrared | DAL.LEVEL_THRESHOLD_LOW,
    VisibleBright = JDLightSpectrumRange.Visible | DAL.LEVEL_THRESHOLD_HIGH,
    VisibleDark = JDLightSpectrumRange.Visible | DAL.LEVEL_THRESHOLD_LOW
}

const enum JDPromixityEvent {
    Close = DAL.LEVEL_THRESHOLD_LOW,
    Far = DAL.LEVEL_THRESHOLD_HIGH
}

const enum JDRotaryEncoderEvent {
    Changed = 0x2233 /* ROT_EV_CHANGED */
}

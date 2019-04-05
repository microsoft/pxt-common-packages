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

    // drivers
    export const JD_DEVICE_CLASS_MAKECODE_START = 2000;
    export const LOGGER_DEVICE_CLASS = 2001;
    export const BATTERY_DEVICE_CLASS = 2002;
    export const ACCELEROMETER_DEVICE_CLASS = 2003;
    export const BUTTON_DEVICE_CLASS = 2004;
    export const TOUCHBUTTON_DEVICE_CLASS = 2005;
    export const LIGHT_SENSOR_DEVICE_CLASS = 2006;
    export const MICROPHONE_DEVICE_CLASS = 2007;
    export const THERMOMETER_DEVICE_CLASS = 2008;
    export const SWITCH_DEVICE_CLASS = 2009;
    export const PIXEL_DEVICE_CLASS = 2010;
    export const HAPTIC_DEVICE_CLASS = 2011;
    export const LIGHT_DEVICE_CLASS = 2012;
    export const KEYBOARD_DEVICE_CLASS = 2013;
    export const MOUSE_DEVICE_CLASS = 2014;
    export const GAMEPAD_DEVICE_CLASS = 2015;
    export const MUSIC_DEVICE_CLASS = 2016;
    export const SERVO_DEVICE_CLASS = 2017;
    export const CONTROLLER_DEVICE_CLASS = 2018;
    export const LCD_DEVICE_CLASS = 2019;

    // events
    export const JD_MESSAGE_BUS_ID = JD_DEVICE_CLASS_MAKECODE_START;
    export const JD_DRIVER_EVT_FILL_CONTROL_PACKET = 2001;

    export const BUTTON_EVENTS = [
        DAL.DEVICE_BUTTON_EVT_CLICK,
        DAL.DEVICE_BUTTON_EVT_DOWN,
        DAL.DEVICE_BUTTON_EVT_UP,
        DAL.DEVICE_BUTTON_EVT_LONG_CLICK
    ];
}

enum JDDriverEvent {
    //% block="connected"
    Connected = DAL.JD_DRIVER_EVT_CONNECTED,
    //% block="disconnected"
    Disconnected = DAL.JD_DRIVER_EVT_DISCONNECTED,
    //% block="paired"
    Paired = DAL.JD_DRIVER_EVT_PAIRED,
    //% block="unpaired"
    Unpaired = DAL.JD_DRIVER_EVT_UNPAIRED,
    //% block="pair rejected"
    PairingRefused = DAL.JD_DRIVER_EVT_PAIR_REJECTED,
    //% block="pairing response"
    PairingResponse = DAL.JD_DRIVER_EVT_PAIRING_RESPONSE,
    //% block="driver error"
    DriverError = DAL.JD_DRIVER_EVT_ERROR
}

enum JDEvent {
    //% block="bus connected"
    BusConnected = DAL.JD_SERIAL_EVT_BUS_CONNECTED,
    //% block="bus disconnected"
    BusDisconnected = DAL.JD_SERIAL_EVT_BUS_DISCONNECTED,
    //% block="driver changed"
    DriverChanged = DAL.JD_LOGIC_DRIVER_EVT_CHANGED,
}

enum JDDriverErrorCode
{
    // No error occurred.
    DRIVER_OK = 0,

    // Device calibration information
    DRIVER_CALIBRATION_IN_PROGRESS,
    DRIVER_CALIBRATION_REQUIRED,

    // The driver has run out of some essential resource (e.g. allocated memory)
    DRIVER_NO_RESOURCES,

    // The driver operation could not be performed as some essential resource is busy (e.g. the display)
    DRIVER_BUSY,

    // I2C / SPI Communication error occured
    DRIVER_COMMS_ERROR,

    // An invalid state was detected (i.e. not initialised)
    DRIVER_INVALID_STATE,

    // an external peripheral has a malfunction e.g. external circuitry is drawing too much power.
    DRIVER_PERIPHERAL_MALFUNCTION
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

enum JDLightAnimation {
    //% block="rainbow"
    Rainbow = JDLightCommand.Rainbow,
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

enum JDGesture {
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

enum JDButtonEvent {
    //% block="click"
    Click = DAL.DEVICE_BUTTON_EVT_CLICK,
    //% block="long click"
    LongClick = DAL.DEVICE_BUTTON_EVT_LONG_CLICK,
    //% block="up"
    Up = DAL.DEVICE_BUTTON_EVT_UP,
    //% block="down"
    Down = DAL.DEVICE_BUTTON_EVT_DOWN
}

enum JDSwitchDirection {
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
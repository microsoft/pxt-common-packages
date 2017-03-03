// Auto-generated. Do not edit.


    /**
     * User interaction on buttons
     */

    declare enum ButtonEvent {
    //% block="click"
    Click = 3,  // DEVICE_BUTTON_EVT_CLICK
    //% block="double click"
    DoubleClick = 6,  // DEVICE_BUTTON_EVT_DOUBLE_CLICK
    //% block="long click"
    LongClick = 4,  // DEVICE_BUTTON_EVT_LONG_CLICK
    //% block="up"
    Up = 2,  // DEVICE_BUTTON_EVT_UP
    //% block="down"
    Down = 1,  // DEVICE_BUTTON_EVT_DOWN
    //% block="hold"
    Hold = 5,  // DEVICE_BUTTON_EVT_HOLD
    }


    declare enum PulseValue {
    //% block=high
    High = 4,  // DEVICE_PIN_EVT_PULSE_HI
    //% block=low
    Low = 5,  // DEVICE_PIN_EVT_PULSE_LO
    }


    declare enum PinPullMode {
    //% block="down"
    PullDown = 0,
    //% block="up"
    PullUp = 1,
    //% block="none"
    PullNone = 2,
    }


    declare enum NumberFormat {
    Int8LE = 1,
    UInt8LE = 2,
    Int16LE = 3,
    UInt16LE = 4,
    Int32LE = 5,
    Int8BE = 6,
    UInt8BE = 7,
    Int16BE = 8,
    UInt16BE = 9,
    Int32BE = 10,
    // UInt32,
    }


    /**
     * How to create the event.
     */

    declare enum EventCreationMode {
    /**
     * Event is initialised, and its event handlers are immediately fired (not suitable for use in interrupts!).
     */
    CreateAndFire = 1,  // CREATE_AND_FIRE
    /**
     * Event is initialised, and no further processing takes place.
     */
    CreateOnly = 0,  // CREATE_ONLY
    }
declare namespace control {
}
declare namespace serial {
}


    declare enum SwitchDirection {
    //% block="left"
    Left = 2,  // DEVICE_BUTTON_EVT_UP
    //% block="right"
    Right = 1,  // DEVICE_BUTTON_EVT_DOWN
    }


    declare enum LightCondition {
    //% block="dark"
    Dark = 1,  // ANALOG_THRESHOLD_LOW
    //% block="bright"
    Bright = 2,  // ANALOG_THRESHOLD_HIGH
    }


    declare enum LoudnessCondition {
    //% block="quiet"
    Quiet = 1,  // ANALOG_THRESHOLD_LOW
    //% block="loud"
    Loud = 2,  // ANALOG_THRESHOLD_HIGH
    }


    declare enum TemperatureCondition {
    //% block="cold"
    Cold = 1,  // ANALOG_THRESHOLD_LOW
    //% block="hot"
    Hot = 2,  // ANALOG_THRESHOLD_HIGH
    }


    declare enum TemperatureUnit {
    //% block="°C"
    Celsius = 0,
    //% block="°F"
    Fahrenheit = 1,
    }
declare namespace input {
}


    declare enum Dimension {
    //% block=x
    X = 0,
    //% block=y
    Y = 1,
    //% block=z
    Z = 2,
    //% block=strength
    Strength = 3,
    }


    declare enum Rotation {
    //% block=pitch
    Pitch = 0,
    //% block=roll
    Roll = 1,
    }


    declare enum AcceleratorRange {
    /**
     * The accelerator measures forces up to 1 gravity
     */
    //%  block="1g"
    OneG = 1,
    /**
     * The accelerator measures forces up to 2 gravity
     */
    //%  block="2g"
    TwoG = 2,
    /**
     * The accelerator measures forces up to 4 gravity
     */
    //% block="4g"
    FourG = 4,
    /**
     * The accelerator measures forces up to 8 gravity
     */
    //% block="8g"
    EightG = 8,
    }


    declare enum Gesture {
    /**
     * Raised when shaken
     */
    //% block=shake
    Shake = 11,  // ACCELEROMETER_EVT_SHAKE
    /**
     * Raised when the device tilts up
     */
    //% block="tilt up"
    TiltUp = 1,  // ACCELEROMETER_EVT_TILT_UP
    /**
     * Raised when the device tilts down
     */
    //% block="tilt down"
    TiltDown = 2,  // ACCELEROMETER_EVT_TILT_DOWN
    /**
     * Raised when the screen is pointing left
     */
    //% block="tilt left"
    TiltLeft = 3,  // ACCELEROMETER_EVT_TILT_LEFT
    /**
     * Raised when the screen is pointing right
     */
    //% block="tilt right"
    TiltRight = 4,  // ACCELEROMETER_EVT_TILT_RIGHT
    /**
     * Raised when the screen faces up
     */
    //% block="face up"
    FaceUp = 5,  // ACCELEROMETER_EVT_FACE_UP
    /**
     * Raised when the screen is pointing up and the board is horizontal
     */
    //% block="face down"
    FaceDown = 6,  // ACCELEROMETER_EVT_FACE_DOWN
    /**
     * Raised when the board is falling!
     */
    //% block="free fall"
    FreeFall = 7,  // ACCELEROMETER_EVT_FREEFALL
    /**
     * Raised when a 3G shock is detected
     */
    //% block="3g"
    ThreeG = 8,  // ACCELEROMETER_EVT_3G
    /**
     * Raised when a 6G shock is detected
     */
    //% block="6g"
    SixG = 9,  // ACCELEROMETER_EVT_6G
    /**
     * Raised when a 8G shock is detected
     */
    //% block="8g"
    EightG = 10,  // ACCELEROMETER_EVT_8G
    }

// Auto-generated. Do not edit. Really.

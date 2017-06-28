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


    /**
     * How to create the event.
     */

    declare enum EventCreationMode {
    /**
     * Event is initialised, and its event handlers are immediately fired (not suitable for use in
     * interrupts!).
     */
    CreateAndFire = 1,  // CREATE_AND_FIRE
    /**
     * Event is initialised, and no further processing takes place.
     */
    CreateOnly = 0,  // CREATE_ONLY
    }

// Auto-generated. Do not edit. Really.

namespace jacdac {
    // Generic commands
    export const CMD_ADVERTISEMENT_DATA = 0x00
    // think power-down of peripheral
    export const CMD_GET_ENABLED = 0x01
    export const CMD_SET_ENABLED = 0x02
    // brightness of LEDs or similar
    export const CMD_SET_INTENSITY = 0x03
    // event from sensor or on broadcast service
    export const CMD_EVENT = 0x04

    // Sensors commands
    // state of sensor or actuator, ie servo angle
    export const CMD_GET_STATE = 0x10
    export const CMD_SET_STATE = 0x11
    // is the sensor streaming state
    export const CMD_SET_STREAMING = 0x12
    export const CMD_GET_STREAMING = 0x13
    // threshold for analog sensor (threshold type in arg; value in payload)
    export const CMD_SET_THRESHOLD = 0x14
    // request to calibrate sensor
    export const CMD_CALIBRATE = 0x15

    export const ARG_LOW_THRESHOLD = 0x01
    export const ARG_HIGH_THRESHOLD = 0x02

    // Commands specific to control service
    // do nothing
    export const CMD_CTRL_NOOP = 0x80
    // blink led or otherwise draw user's attention
    export const CMD_CTRL_IDENTIFY = 0x81
}

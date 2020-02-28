namespace jacdac {
    export const REP_ADVERTISEMENT_DATA = 0x0000
    // think power-down of peripheral
    export const REP_ENABLED = 0x0001
    // state of sensor or actuator, ie servo angle
    export const REP_STATE = 0x0002
    // is the sensor streaming state
    export const REP_STREAMING = 0x0003
    // threshold for analog sensor (threshold type in arg; value in payload)
    export const REP_THRESHOLD = 0x0004
    // event from sensor or on broadcast service
    export const REP_EVENT = 0x0005
    // request to calibrate sensor
    export const REP_CALIBRATE = 0x0006
    export const REP_INTENSITY = 0x0007

    export const CMD_GET_MASK = 0x8000
    export const CMD_SET_MASK = 0xC000

    export const CMD_GET_ADVERTISEMENT_DATA = CMD_GET_MASK | REP_ADVERTISEMENT_DATA
    export const CMD_GET_ENABLED = CMD_GET_MASK | REP_ENABLED
    export const CMD_SET_ENABLED = CMD_SET_MASK | REP_ENABLED
    export const CMD_GET_STATE = CMD_GET_MASK | REP_STATE
    export const CMD_SET_STATE = CMD_SET_MASK | REP_STATE
    export const CMD_SET_STREAMING = CMD_SET_MASK | REP_STREAMING
    export const CMD_GET_STREAMING = CMD_GET_MASK | REP_STREAMING
    export const CMD_GET_THRESHOLD = CMD_GET_MASK | REP_THRESHOLD
    export const CMD_SET_THRESHOLD = CMD_SET_MASK | REP_THRESHOLD
    export const CMD_CALIBRATE = CMD_SET_MASK | REP_CALIBRATE
    export const CMD_GET_CALIBRATION_STATUS = CMD_GET_MASK | REP_CALIBRATE
    export const CMD_GET_INTENSITY = CMD_GET_MASK | REP_INTENSITY
    export const CMD_SET_INTENSITY = CMD_SET_MASK | REP_INTENSITY

    export const ARG_LOW_THRESHOLD = 0x0001
    export const ARG_HIGH_THRESHOLD = 0x0002
}
namespace jacdac {
    export const RESP_ADVERTISEMENT_DATA = 0x0000
    export const RESP_MY_STATE = 0x0001
    export const RESP_EVENT = 0x0002

    export const CMD_GET_ADVERTISEMENT_DATA = 0x8000
    export const CMD_SET_STATE = 0x8001
    export const CMD_START_STREAM = 0x8003
    export const CMD_STOP_STREAM = 0x8004
    export const CMD_SET_THRESHOLD = 0x8005
    export const CMD_CALIBRATE = 0x8006

    export const ARG_LOW_THRESHOLD = 0x0001
    export const ARG_HIGH_THRESHOLD = 0x0002
}
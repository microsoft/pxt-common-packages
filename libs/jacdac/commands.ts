namespace jacdac {

    // Registers 0x001-0x07f - r/w common to all services
    // Registers 0x080-0x0ff - r/w defined per-service
    // Registers 0x100-0x17f - r/o common to all services
    // Registers 0x180-0x1ff - r/o defined per-service
    // Registers 0x200-0xeff - custom, defined per-service
    // Registers 0xf00-0xfff - reserved for implementation, should not be on the wire

    // this is either binary (0 or non-zero), or can be gradual (eg. brightness of neopixel)
    export const REG_INTENSITY = 0x01
    // the primary value of actuator (eg. servo angle)
    export const REG_VALUE = 0x02
    // enable/disable streaming
    export const REG_IS_STREAMING = 0x03
    // streaming interval in miliseconds
    export const REG_STREAMING_INTERVAL = 0x04
    // for analog sensors
    export const REG_LOW_THRESHOLD = 0x05
    export const REG_HIGH_THRESHOLD = 0x06
    // limit power drawn; in mA
    export const REG_MAX_POWER = 0x07

    // eg. one number for light sensor, all 3 coordinates for accelerometer
    export const REG_READING = 0x101

    export const CMD_GET_REG = 0x1000
    export const CMD_SET_REG = 0x2000

    // Commands 0x000-0x07f - common to all services
    // Commands 0x080-0xeff - defined per-service
    // Commands 0xf00-0xfff - reserved for implementation
    // enumeration data for CTRL, ad-data for other services
    export const CMD_ADVERTISEMENT_DATA = 0x00
    // event from sensor or on broadcast service
    export const CMD_EVENT = 0x01
    // request to calibrate sensor
    export const CMD_CALIBRATE = 0x02
    // request human-readable description of service
    export const CMD_GET_DESCRIPTION = 0x03

    // Commands specific to control service
    // do nothing
    export const CMD_CTRL_NOOP = 0x80
    // blink led or otherwise draw user's attention
    export const CMD_CTRL_IDENTIFY = 0x81
    // reset device
    export const CMD_CTRL_RESET = 0x82
}

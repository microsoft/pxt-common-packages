namespace jacdac{
    export const DEVICE_OK = 0;


    export const JD_CONTROL_PACKET_HEADER_SIZE = 10
    export const JD_CONTROL_ROLLING_TIMEOUT_VAL = 3

    export const JD_SERVICE_STATUS_FLAGS_INITIALISED = 0x02

    export const JD_SERVICE_INFO_HEADER_SIZE = 6

    export const JD_DEVICE_FLAGS_NACK = 0x08
    export const JD_DEVICE_FLAGS_HAS_NAME = 0x04
    export const JD_DEVICE_FLAGS_PROPOSING = 0x02
    export const JD_DEVICE_FLAGS_REJECT = 0x01

    export const JD_DEVICE_MAX_HOST_SERVICES = 16

    export const JD_SERIAL_HEADER_SIZE = 4;
    export const JD_SERIAL_CRC_HEADER_SIZE = 2;
    export const JD_SERIAL_MAX_PAYLOAD_SIZE = 255;

    export const JD_SERVICE_NUMBER_UNITIALISED_VAL = 65535;

    const JD_SERIAL_BAUD_1M = 1;
    const JD_SERIAL_BAUD_500K = 2;
    const JD_SERIAL_BAUD_250K = 4;
    const JD_SERIAL_BAUD_125K = 8;

    export const JD_DEVICE_DEFAULT_COMMUNICATION_RATE = JD_SERIAL_BAUD_1M;

    export enum JDBaudRate
    {
        Baud1M = JD_SERIAL_BAUD_1M,
        Baud500k = JD_SERIAL_BAUD_500K,
        Baud250k = JD_SERIAL_BAUD_250K,
        Baud125k = JD_SERIAL_BAUD_125K
    }
}
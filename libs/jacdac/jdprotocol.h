#ifndef __JDPROTOCOL_H
#define __JDPROTOCOL_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// 255 minus size of the serial header, rounded down to 4
#define JD_SERIAL_PAYLOAD_SIZE 236
#define JD_SERIAL_FULL_HEADER_SIZE 16

#define JD_SERVICE_CLASS_CTRL 0x00000000

#define JD_SERVICE_NUMBER_CTRL 0x00
#define JD_SERVICE_NUMBER_MASK 0x3f
#define JD_SERVICE_NUMBER_CRC_ACK 0x3f

// the COMMAND flag signifies that the device_identifier is the recipent
// (i.e., it's a command for the peripheral); the bit clear means device_identifier is the source
// (i.e., it's a report from peripheral or a broadcast message)
#define JD_FRAME_FLAG_COMMAND 0x01
// an ACK should be issued with CRC of this package upon reception
#define JD_FRAME_FLAG_ACK_REQUESTED 0x02
// the device_identifier contains target service class number
#define JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS 0x04

#define JD_FRAME_SIZE(pkt) ((pkt)->size + 12)

// Generic commands
#define JD_CMD_ADVERTISEMENT_DATA 0x00
// think power-down of peripheral
#define JD_CMD_GET_ENABLED 0x01
#define JD_CMD_SET_ENABLED 0x02
// brightness of LEDs or similar
#define JD_CMD_SET_INTENSITY 0x03
// event from sensor or on broadcast service
#define JD_CMD_EVENT 0x04

// Sensors commands
// state of sensor or actuator, ie servo angle
#define JD_CMD_GET_STATE 0x10
#define JD_CMD_SET_STATE 0x11
// is the sensor streaming state
#define JD_CMD_GET_STREAMING 0x12
#define JD_CMD_SET_STREAMING 0x13
// threshold for analog sensor (threshold type in arg; value in payload)
#define JD_CMD_SET_THRESHOLD 0x14
// request to calibrate sensor
#define JD_CMD_CALIBRATE 0x15
// this is eg. number and type of neopixels connected
#define JD_CMD_GET_CONFIG 0x16
#define JD_CMD_SET_CONFIG 0x17

// Commands specific to control service
// do nothing
#define JD_CMD_CTRL_NOOP 0x80
// blink led or otherwise draw user's attention
#define JD_CMD_CTRL_IDENTIFY 0x81
// reset device
#define JD_CMD_CTRL_RESET 0x82

struct _jd_packet_t {
    uint16_t crc;
    uint8_t _size; // of frame data[]
    uint8_t flags;

    uint64_t device_identifier;

    uint8_t service_size;
    uint8_t service_number;
    uint8_t service_command;
    uint8_t service_arg;

    uint8_t data[0];
} __attribute__((__packed__, aligned(4)));
typedef struct _jd_packet_t jd_packet_t;

struct _jd_frame_t {
    uint16_t crc;
    uint8_t size;
    uint8_t flags;

    uint64_t device_identifier;

    uint8_t data[JD_SERIAL_PAYLOAD_SIZE + 4];
} __attribute__((__packed__, aligned(4)));
typedef struct _jd_frame_t jd_frame_t;

#define JDSPI_MAGIC 0x7ACD
#define JDSPI_MAGIC_NOOP 0xB3CD

#ifdef __cplusplus
}
#endif

#endif

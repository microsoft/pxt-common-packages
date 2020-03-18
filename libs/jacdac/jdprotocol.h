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

#define JD_SERVICE_NUMBER_MASK 0x3f
#define JD_SERVICE_NUMBER_CRC_ACK 0x3f

// the COMMAND flag signifies that the device_identifier is the recipent
// (i.e., it's a command for the peripheral); the bit clear means device_identifier is the source
// (i.e., it's a report from peripheral or a broadcast message)
#define JD_PACKET_FLAG_COMMAND 0x01
// an ACK should be issued with CRC of this package upon reception
#define JD_PACKET_FLAG_ACK_REQUESTED 0x02
// the device_identifier contains target service class number
#define JD_PACKET_FLAG_IDENTIFIER_IS_SERVICE_CLASS 0x04

#define JD_PACKET_SIZE(pkt) ((pkt)->_size + JD_SERIAL_FULL_HEADER_SIZE)

struct _jd_packet_t {
    uint16_t crc;
    uint8_t _size; // of data[] before decompression
    uint8_t flags;

    uint64_t device_identifier;

    uint8_t service_size;
    uint8_t service_number;
    uint8_t service_command;
    uint8_t service_arg;

    uint8_t data[0];
} __attribute__((__packed__, aligned(4)));
typedef struct _jd_packet_t jd_packet_t;

typedef struct {
    jd_packet_t header;
    uint8_t data[JD_SERIAL_PAYLOAD_SIZE + 1];
} jd_serial_packet_t;

#define JDSPI_MAGIC 0x7ACDAC01

#define JDSPI_PKTSIZE 252
#define JDSPI_HEADER_SIZE 8

typedef struct {
    uint16_t magic;
    uint8_t size; // of data[]
    uint8_t service_number;

    uint16_t service_command;
    uint16_t service_arg;

    uint8_t data[JDSPI_PKTSIZE - JDSPI_HEADER_SIZE];
} jd_spi_packet_t;

#ifdef __cplusplus
}
#endif

#endif

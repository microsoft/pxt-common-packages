#ifndef __JDPROTOCOL_H
#define __JDPROTOCOL_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// 255 minus size of the serial header, rounded to 4
#define JD_SERIAL_PAYLOAD_SIZE 236
#define JD_SERIAL_FULL_HEADER_SIZE 16

#define JD_SERIAL_FLAG_DEVICE_ID_IS_RECIPIENT                                                      \
    0x01 // device_identifier is the intended recipient (and not source) of the message

typedef struct {
    uint16_t crc;
    uint8_t size; // of data[]
    uint8_t serial_flags;

    uint8_t service_number;
    uint8_t service_command;
    uint16_t service_arg;

    uint64_t device_identifier;

    uint8_t data[0];
} __attribute((__packed__)) __attribute__((aligned(4))) jd_packet_t;

typedef struct {
    jd_packet_t header;
    uint8_t data[JD_SERIAL_PAYLOAD_SIZE + 1];
} jd_serial_packet_t;

#define JDSPI_MAGIC 0x7ACDAC01

#define JDSPI_PKTSIZE 252
#define JDSPI_HEADER_SIZE 8

typedef struct {
    uint16_t magic;
    uint8_t reserved;
    uint8_t size; // of data[]

    uint8_t service_number;
    uint8_t service_command;
    uint16_t service_arg;

    uint8_t data[JDSPI_PKTSIZE - JDSPI_HEADER_SIZE];
} jd_spi_packet_t;

#ifdef __cplusplus
}
#endif

#endif

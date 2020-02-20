#ifndef __JDPROTOCOL_H
#define __JDPROTOCOL_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// 255 minus size of the serial header, rounded to 4
#define JD_SERIAL_PAYLOAD_SIZE 236
#define JD_SERIAL_HEADER_SIZE 16

#define JD_SERIAL_FLAG_DEVICE_ID_IS_RECIPIENT 0x01 // device_identifier is the intended recipient (and not source) of the message
#define JD_SERIAL_VERSION 1

typedef struct {
    uint16_t crc;
    uint8_t version; // JD_SERIAL_VERSION
    uint8_t serial_flags;
    uint64_t device_identifier;
} __attribute((__packed__)) __attribute__((aligned(4))) jd_serial_header_t;

typedef struct {
    uint8_t size; // of the payload
    uint8_t service_number;
    uint8_t service_command;
    uint8_t service_arg;
    uint8_t data[0];
} __attribute((__packed__)) __attribute__((aligned(4))) jd_packet_t;

typedef struct {
    jd_serial_header_t serial;
    jd_packet_t pkt;
    uint8_t data[JD_SERIAL_PAYLOAD_SIZE + 1];
} jd_serial_packet_t;

#define JDSPI_MAGIC 0x7ACDAC01

#define JDSPI_PKTSIZE 252
#define JDSPI_HEADER_SIZE 8

typedef struct {
    uint32_t magic;
    jd_packet_t pkt;
    uint8_t data[JDSPI_PKTSIZE - JDSPI_HEADER_SIZE];
} jd_spi_packet_t;


#ifdef __cplusplus
}
#endif

#endif

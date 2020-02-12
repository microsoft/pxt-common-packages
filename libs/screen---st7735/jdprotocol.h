#ifndef __JDPROTOCOL_H
#define __JDPROTOCOL_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// 255 minus size of the serial header, rounded to 4
#define JD_SERIAL_PAYLOAD_SIZE 236

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
    uint8_t flags;
    uint8_t service_number;
    uint8_t service_command;
    uint8_t data[0];
} __attribute((__packed__)) __attribute__((aligned(4))) jd_packet_t;

typedef struct {
    jd_serial_header_t serial;
    jd_packet_t pkt;
    uint8_t data[JD_SERIAL_PAYLOAD_SIZE + 1];
} jd_serial_packet_t;

#define JD_DEVICE_FLAGS_NACK 0x08
#define JD_DEVICE_FLAGS_HAS_NAME 0x04
// #define JD_DEVICE_FLAGS_PROPOSING                       0x02
// #define JD_DEVICE_FLAGS_REJECT                          0x01

#define JD_SERVICE_FLAGS_ERROR 0x80

#define JD_SERVICE_INFO_SIZE 6

typedef struct {
    uint32_t service_class; // the class of the service
    uint8_t service_flags;
    uint8_t advertisement_size;   // size of the following field
    uint8_t advertisement_data[]; // optional additional data
} __attribute((__packed__)) jd_service_information_t;

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

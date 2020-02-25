#ifndef __JDLOW_H
#define __JDLOW_H

#include "jdprotocol.h"
#include <hw.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef void (*cb_t)(void);

// Required by jdlow.c
void jd_panic(void);
void target_enable_irq(void);
void target_disable_irq(void);
void target_wait_us(uint32_t n);

void tim_init(void);
uint64_t tim_get_micros(void);
void tim_set_timer(int delta, cb_t cb);

void uart_init(void);
int uart_start_tx(const void *data, uint32_t numbytes);
void uart_start_rx(void *data, uint32_t maxbytes);
void uart_disable(void);
void uart_wait_high(void);

void log_pin_set(int line, int v);

void app_queue_annouce(void);
void app_handle_packet(jd_packet_t *pkt);
void app_packet_sent(jd_packet_t *pkt);
void app_packet_dropped(jd_packet_t *pkt);


// Provided jdutil.c
uint32_t jd_random_around(uint32_t v);
uint32_t jd_random(void);
void jd_seed_random(uint32_t s);
uint32_t jd_hash_fnv1a(const void *data, unsigned len);
uint16_t jd_crc16(const void *data, uint32_t size);

// Provided jdlow.c
void jd_init(void);
int jd_queue_packet(jd_packet_t *pkt);
uint32_t jd_get_num_pending_tx(void);
uint32_t jd_get_free_queue_space(void);
// these are to be called by uart implementation
void jd_tx_completed(int errCode);
void jd_rx_completed(int dataLeft);
void jd_line_falling(void);


#ifdef __cplusplus
}
#endif

#endif

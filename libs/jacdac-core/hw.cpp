#include "pxt.h"
#include "jdlow.h"

void jd_panic(void) {
    target_panic(PANIC_JACDAC);
}

static cb_t tim_cb;
static void tim_callback(Event) {
    cb_t f = tim_cb;
    if (f) {
        tim_cb = NULL;
        f();
    }
}

void tim_init() {
    EventModel::defaultEventBus->listen(DEVICE_ID_JACDAC_PHYS, 0x1234, tim_callback,
                                        MESSAGE_BUS_LISTENER_IMMEDIATE);
}

uint64_t tim_get_micros(void) {
    return current_time_us();
}

void tim_set_timer(int delta, cb_t cb) {
    system_timer_cancel_event(DEVICE_ID_JACDAC_PHYS, 0x1234);
    tim_cb = cb;
    system_timer_event_after(delta, DEVICE_ID_JACDAC_PHYS, 0x1234);
}

void uart_init(void);
int uart_start_tx(const void *data, uint32_t numbytes);
void uart_start_rx(void *data, uint32_t maxbytes);
void uart_disable(void);
void uart_wait_high(void);

void app_queue_annouce(void);
void app_handle_packet(jd_serial_packet_t *pkt);

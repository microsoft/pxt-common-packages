#include "pxt.h"
#include "jdlow.h"

#include "ZSingleWireSerial.h"

#define LOG(msg, ...) DMESG("JD: " msg, ##__VA_ARGS__)
//#define LOG(...) ((void)0)

static ZSingleWireSerial *sws;
static cb_t tim_cb;
static uint8_t status;

#define STATUS_IN_RX 0x01
#define STATUS_IN_TX 0x02

void pin_log(int v) {
    static DigitalInOutPin p;
    if (!p)
        p = LOOKUP_PIN(D2);
    p->setDigitalValue(v);
}

void pin_pulse() {
    pin_log(1);
    pin_log(0);
}

void jd_panic(void) {
    target_panic(PANIC_JACDAC);
}

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
    system_timer_event_after_us(delta, DEVICE_ID_JACDAC_PHYS, 0x1234);
}

static void setup_exti() {
    LOG("setup exti; %d", sws->p.name);
    sws->setMode(SingleWireDisconnected);
    // force transition to output so that the pin is reconfigured.
    // also drive the bus high for a little bit.
    sws->p.setDigitalValue(1);
    sws->p.getDigitalValue(PullMode::Up);
    sws->p.eventOn(DEVICE_PIN_INTERRUPT_ON_EDGE);
}

static void send_brk() {
    sws->p.setDigitalValue(0);
    target_wait_us(9);
    sws->p.setDigitalValue(1);
}

static void line_falling(int lineV) {
    pin_log(1);
    // LOG("line %d @%d", lineV, (int)tim_get_micros());
    if (lineV)
        return; // rising

    if (sws->p.isOutput()) {
        // LOG("in send already");
        return;
    }

    sws->p.eventOn(DEVICE_PIN_EVENT_NONE);
    jd_line_falling();
}

static void sws_done(uint16_t errCode) {
    pin_log(1);
    pin_log(0);
    LOG("sws_done %d @%d", errCode, (int)tim_get_micros());
    switch (errCode) {
    case SWS_EVT_DATA_SENT:
        if (status & STATUS_IN_TX) {
            send_brk();
            jd_tx_completed(0);
        }
        break;
    case SWS_EVT_DATA_RECEIVED:
        LOG("DMA overrun");
    case SWS_EVT_ERROR: // brk condition
        // sws->getBytesReceived() always returns 1 on NRF
        if (status & STATUS_IN_RX)
            jd_rx_completed(0);
        else
            LOG("SWS error");
        break;
    }
    status = 0;
    setup_exti();
}

void uart_init() {
    sws = new ZSingleWireSerial(*LOOKUP_PIN(JACK_TX));
    sws->setBaud(1000000);

    sws->p.setIRQ(line_falling);
    sws->setIRQ(sws_done);
    setup_exti();
    pin_log(0);
}

int uart_start_tx(const void *data, uint32_t numbytes) {
    if (status & STATUS_IN_TX)
        jd_panic();

    if (status & STATUS_IN_RX)
        return -1;

    sws->p.eventOn(DEVICE_PIN_EVENT_NONE);

    if (status & STATUS_IN_RX)
        return -1; // we got hit by the IRQ before we managed to disable it

    // try to pull the line low, provided it currently reads as high
    if (sws->p.getAndSetDigitalValue(0)) {
        // we failed - the line was low - start reception
        // jd_lin_falling() would normally execute from EXTI, which has high
        // priority - we simulate this by completely disabling IRQs
        target_disable_irq();
        jd_line_falling();
        target_enable_irq();
        return -1;
    }

    target_wait_us(10);
    status |= STATUS_IN_TX;
    sws->p.setDigitalValue(1);

    // LOG("start tx @%d", (int)tim_get_micros());
    target_wait_us(40);

    sws->sendDMA((uint8_t *)data, numbytes);
    return 0;
}

void uart_start_rx(void *data, uint32_t maxbytes) {
    // LOG("start rx @%d", (int)tim_get_micros());
    if (status & STATUS_IN_RX)
        jd_panic();
    status |= STATUS_IN_RX;
    sws->receiveDMA((uint8_t *)data, maxbytes);
    pin_log(0);
}

void uart_disable() {
    sws->abortDMA();
    status = 0;
    setup_exti();
}

void uart_wait_high() {
    while (sws->p.getDigitalValue() == 0)
        ;
}

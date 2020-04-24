#include "pxt.h"
#include "jdlow.h"

#include "ZSingleWireSerial.h"

//#define ENABLE_PIN_LOG 1

#define DEVICE_ID DEVICE_ID_JACDAC_PHYS

#define LOG(msg, ...) DMESG("JD: " msg, ##__VA_ARGS__)
//#define LOG(...) ((void)0)

static ZSingleWireSerial *sws;
static cb_t tim_cb;
static volatile uint8_t status;
static uint16_t currEvent;

#define STATUS_IN_RX 0x01
#define STATUS_IN_TX 0x02

#ifdef ENABLE_PIN_LOG
#define NUM_LOG_PINS 5

static DevicePin **logPins;
static uint32_t *logPinMasks;

static void init_log_pins() {
    logPins = new DevicePin *[NUM_LOG_PINS];
    logPins[0] = LOOKUP_PIN(A5);
    logPins[1] = LOOKUP_PIN(A1);
    logPins[2] = LOOKUP_PIN(A2);
    logPins[3] = LOOKUP_PIN(A3);
    logPins[4] = LOOKUP_PIN(A4);

    logPinMasks = new uint32_t[NUM_LOG_PINS];
    for (int i = 0; i < NUM_LOG_PINS; ++i) {
        logPins[i]->setDigitalValue(0);
        logPinMasks[i] = 1 << (uint32_t)logPins[i]->name;
    }
}

static inline void log_pin_set_core(unsigned line, int v) {
    if (line >= NUM_LOG_PINS)
        return;
#ifdef NRF52_SERIES
    if (v)
        NRF_P0->OUTSET = logPinMasks[line];
    else
        NRF_P0->OUTCLR = logPinMasks[line];
#else
    logPins[line]->setDigitalValue(v);
#endif
}
#else
static void log_pin_set_core(unsigned, int) {}
static void init_log_pins() {}
#endif

extern "C" void timer_log(int line, int v) {
    //    log_pin_set_core(line, v);
}

void log_pin_set(int line, int v) {
    // if (line == 1)
    log_pin_set_core(line, v);
}

static void pin_log(int v) {
    log_pin_set(3, v);
}

static void pin_pulse() {
    pin_log(1);
    pin_log(0);
}

void jd_panic(void) {
    target_panic(PANIC_JACDAC);
}

static void tim_callback(Event e) {
    cb_t f = tim_cb;
    if (f) {
        tim_cb = NULL;
        if (e.value == currEvent)
            f();
    }
}

void tim_init() {
    init_log_pins();

    EventModel::defaultEventBus->listen(DEVICE_ID, 0, tim_callback, MESSAGE_BUS_LISTENER_IMMEDIATE);
}

uint64_t tim_get_micros(void) {
    return current_time_us();
}

// timer overhead measurements (without any delta compensation)
// STM32F030 - +5.5us +7.8us (not this code - just raw)
// ATSAMD51  - +13us +10.8us
// ATSAMD21  - +29us +20us

void tim_set_timer(int delta, cb_t cb) {
     // compensate for overheads
    delta -= JD_TIM_OVERHEAD;
    if (delta < 20)
        delta = 20;
    target_disable_irq();
    uint16_t prev = currEvent;
    currEvent++;
    if (currEvent == 0)
        currEvent = 1;
    tim_cb = cb;
    system_timer_event_after_us(delta, DEVICE_ID, currEvent);
    system_timer_cancel_event(DEVICE_ID, prev); // make sure we don't get the same slot
    target_enable_irq();
}

static void setup_exti() {
    // LOG("setup exti; %d", sws->p.name);
    sws->setMode(SingleWireDisconnected);
    // force transition to output so that the pin is reconfigured.
    // also drive the bus high for a little bit.
    sws->p.setDigitalValue(1);
    sws->p.getDigitalValue(PullMode::Up);
    sws->p.eventOn(DEVICE_PIN_INTERRUPT_ON_EDGE);
}

static void line_falling(int lineV) {
    pin_log(1);
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
    pin_pulse();
    pin_pulse();

    // LOG("sws_done %d @%d", errCode, (int)tim_get_micros());

    switch (errCode) {
    case SWS_EVT_DATA_SENT:
        if (status & STATUS_IN_TX) {
            status &= ~STATUS_IN_TX;
            sws->setMode(SingleWireDisconnected);
            // force reconfigure
            sws->p.getDigitalValue();
            // send break signal
            sws->p.setDigitalValue(0);
            target_wait_us(11);
            sws->p.setDigitalValue(1);
            jd_tx_completed(0);
        }
        break;
    case SWS_EVT_ERROR: // brk condition
        if (!(status & STATUS_IN_RX)) {
            LOG("SWS error");
            target_panic(122);
        } else {
            return;
        }
        break;
    case SWS_EVT_DATA_RECEIVED:
        // LOG("DMA overrun");
        // sws->getBytesReceived() always returns 1 on NRF
        if (status & STATUS_IN_RX) {
            status &= ~STATUS_IN_RX;
            sws->setMode(SingleWireDisconnected);
            jd_rx_completed(0);
        } else {
            LOG("double complete");
            target_panic(122);
        }
        sws->abortDMA();
        break;
    }
    setup_exti();

    pin_pulse();
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

    target_disable_irq();
    if (status & STATUS_IN_RX) {
        target_enable_irq();
        return -1;
    }
    sws->p.eventOn(DEVICE_PIN_EVENT_NONE);
    int val = sws->p.getDigitalValue();
    target_enable_irq();

    // try to pull the line low, provided it currently reads as high
    if (val == 0 || sws->p.getAndSetDigitalValue(0)) {
        // we failed - the line was low - start reception
        // jd_line_falling() would normally execute from EXTI, which has high
        // priority - we simulate this by completely disabling IRQs
        target_disable_irq();
        jd_line_falling();
        target_enable_irq();
        return -1;
    }

    target_wait_us(9);
    status |= STATUS_IN_TX;
    sws->p.setDigitalValue(1);

    // LOG("start tx @%d", (int)tim_get_micros());
    target_wait_us(40);

    pin_pulse();

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
    pin_pulse();
    sws->abortDMA();
    status = 0;
    setup_exti();
    pin_pulse();
}

int uart_wait_high() {
    int timeout = 1000; // should be around 100-1000us
    while (timeout-- > 0 && sws->p.getDigitalValue() == 0)
        ;
    if (timeout <= 0)
        return -1;
    return 0;
}

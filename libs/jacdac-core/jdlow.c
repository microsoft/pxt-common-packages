#include "jdlow.h"

//#define LOG(msg, ...) DMESG("JD: " msg, ##__VA_ARGS__)
#define LOG(...) ((void)0)

#define ERROR(msg, ...)                                                                            \
    do {                                                                                           \
        DMESG("JD-ERROR: " msg, ##__VA_ARGS__);                                                    \
        signal_error();                                                                            \
    } while (0)

#define RAM_FUNC __attribute__((noinline, long_call, section(".data")))

#define JD_STATUS_RX_ACTIVE 0x01
#define JD_STATUS_TX_ACTIVE 0x02
#define TX_QUEUE_SIZE 3

static jd_serial_packet_t _rxBuffer[2];
static jd_serial_packet_t *rxPkt = &_rxBuffer[0];
static void set_tick_timer(uint8_t statusClear);
static uint64_t nextAnnounce;
static volatile uint8_t status;
static volatile uint8_t numPending;

static uint32_t numFalls;
static uint32_t numOKPkts;

static jd_header_t *txQueue[TX_QUEUE_SIZE];

static void pulse1() {
    log_pin_set(1, 1);
    log_pin_set(1, 0);
}

static void signal_error() {
    log_pin_set(2, 1);
    log_pin_set(2, 0);
}

static void signal_write(int v) {
    log_pin_set(1, v);
}

static void set_log_pin4(int v) {}
static void pulse_log_pin() {}

void jd_init() {
    tim_init();
    set_tick_timer(0);
    uart_init();
}

static void tx_done() {
    signal_write(0);
    set_tick_timer(JD_STATUS_TX_ACTIVE);
}

static void shift_queue() {
    target_disable_irq();
    for (int i = 1; i < TX_QUEUE_SIZE; ++i)
        txQueue[i - 1] = txQueue[i];
    target_enable_irq();
}

void jd_tx_completed(int errCode) {
    LOG("tx done: %d", errCode);
    if (numPending == 0)
        jd_panic();
    target_disable_irq();
    jd_header_t *prev = txQueue[0];
    shift_queue();
    numPending--;
    target_enable_irq();
    app_packet_sent(prev);
    tx_done();
}

uint32_t jd_get_num_pending_tx() {
    return numPending;
}

uint32_t jd_get_free_queue_space() {
    for (int i = TX_QUEUE_SIZE - 1; i >= 0; ++i) {
        if (txQueue[i])
            return TX_QUEUE_SIZE - i - 1;
    }
    return 0;
}

static void tick() {
    if (tim_get_micros() > nextAnnounce) {
        // pulse_log_pin();
        nextAnnounce = tim_get_micros() + jd_random_around(400000);
        app_queue_annouce();
    }
    set_tick_timer(0);
}

static void flush_tx_queue() {
    LOG("flush %d", status);
    target_disable_irq();
    if (status & (JD_STATUS_RX_ACTIVE | JD_STATUS_TX_ACTIVE)) {
        target_enable_irq();
        return;
    }
    status |= JD_STATUS_TX_ACTIVE;
    target_enable_irq();

    signal_write(1);
    if (uart_start_tx(txQueue[0], txQueue[0]->size + JD_SERIAL_FULL_HEADER_SIZE) < 0) {
        ERROR("race on TX");
        tx_done();
        return;
    }

    set_tick_timer(0);
}

static void set_tick_timer(uint8_t statusClear) {
    target_disable_irq();
    if (statusClear) {
        // LOG("st %d @%d", statusClear, status);
        status &= ~statusClear;
    }
    if ((status & JD_STATUS_RX_ACTIVE) == 0) {
        if (txQueue[0] && !(status & JD_STATUS_TX_ACTIVE))
            tim_set_timer(jd_random_around(50), flush_tx_queue);
        else
            tim_set_timer(10000, tick);
    }
    target_enable_irq();
}

static void rx_timeout() {
    target_disable_irq();
    ERROR("RX timeout");
    uart_disable();
    set_log_pin4(0);
    set_tick_timer(JD_STATUS_RX_ACTIVE);
    target_enable_irq();
}

void jd_line_falling() {
    pulse_log_pin();
    set_log_pin4(1);
    numFalls++;
    // LOG("fall %d", numFalls);
    // target_disable_irq();
    if (status & JD_STATUS_RX_ACTIVE)
        jd_panic();
    status |= JD_STATUS_RX_ACTIVE;

    memset(rxPkt, 0, JD_SERIAL_FULL_HEADER_SIZE);

    // otherwise we can enable RX in the middle of LO pulse
    uart_wait_high();
    target_wait_us(2);

    uart_start_rx(rxPkt, sizeof(*rxPkt));

    tim_set_timer(sizeof(*rxPkt) * 12 + 60, rx_timeout);
    // target_enable_irq();
}

void jd_rx_completed(int dataLeft) {
    jd_serial_packet_t *pkt = rxPkt;

    if (rxPkt == &_rxBuffer[0])
        rxPkt = &_rxBuffer[1];
    else
        rxPkt = &_rxBuffer[0];

    set_log_pin4(0);
    set_tick_timer(JD_STATUS_RX_ACTIVE);

    if (dataLeft < 0) {
        ERROR("rx error: %d", dataLeft);
        return;
    }

    uint32_t txSize = sizeof(*pkt) - dataLeft;
    uint32_t declaredSize = pkt->header.size + JD_SERIAL_FULL_HEADER_SIZE;
    if (txSize < declaredSize) {
        ERROR("pkt too short");
        return;
    }
    uint16_t crc = jd_crc16((uint8_t *)pkt + 2, declaredSize - 2);
    if (crc != pkt->header.crc) {
        ERROR("crc mismatch");
        return;
    }

    if (crc == 0) {
        ERROR("crc==0");
        return;
    }

    numOKPkts++;

    pulse1();
    app_handle_packet(&pkt->header);
}

int jd_queue_packet(jd_header_t *pkt) {
    if (!pkt)
        return -2;

    uint32_t declaredSize = pkt->size + JD_SERIAL_FULL_HEADER_SIZE;
    pkt->crc = jd_crc16((uint8_t *)pkt + 2, declaredSize - 2);
    int queued = 0;

    target_disable_irq();
    if (numPending < TX_QUEUE_SIZE) {
        txQueue[numPending++] = pkt;
        queued = 1;
    }
    target_enable_irq();

    if (!queued) {
        app_packet_dropped(pkt);
        ERROR("TX overflow");
        return -1;
    }

    set_tick_timer(0);
    return 0;
}

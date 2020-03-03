#include "pxt.h"
#include "jdlow.h"

#define COUNT_SERVICE 1

#define LOG(msg, ...) DMESG("JDAPP: " msg, ##__VA_ARGS__)
//#define LOG(...) ((void)0)

#define DEVICE_ID DEVICE_ID_JACDAC

#define EVT_DATA_READY 1
#define EVT_QUEUE_ANNOUNCE 100

namespace jacdac {

struct RxPkt {
    RxPkt *next;
    jd_packet_t pkt;
};

#define MAX_RX 10

static RxPkt *rxQ;

#ifdef COUNT_SERVICE
typedef struct {
    jd_packet_t hd;
    uint32_t count;
} count_service_pkt_t;

static count_service_pkt_t cnt;

static uint32_t prevCnt;
static uint32_t numErrors, numPkts, numSent;

static void queue_cnt() {
    if (jd_get_num_pending_tx() <= 0) {
        cnt.count++;
        cnt.hd.size = 4;
        cnt.hd.device_identifier = 0x65646f43656b614d;
        cnt.hd.service_number = 0x42;
        auto s = new count_service_pkt_t;
        *s = cnt;
        numSent++;
        jd_queue_packet(&s->hd);
    }
}

static void signal_error() {
    log_pin_set(2, 1);
    log_pin_set(2, 0);
}

static void handle_count_packet(jd_packet_t *pkt) {
    numPkts++;
    count_service_pkt_t *cs = (count_service_pkt_t *)pkt;
    uint32_t c = cs->count;
    if (prevCnt && prevCnt + 1 != c) {
        signal_error();
        numErrors++;
        DMESG("ERR %d/%d %d snt:%d", numErrors, numPkts, numErrors * 10000 / numPkts, numSent);
    }
    prevCnt = c;
}
#else
static void handle_count_packet(jd_packet_t *) {}
static void queue_cnt() {}
#endif

extern "C" void app_queue_annouce() {
    //    LOG("announce");
    queue_cnt();
    Event(DEVICE_ID, EVT_QUEUE_ANNOUNCE);
}

extern "C" int app_handle_packet(jd_packet_t *pkt) {
    // LOG("PKT from %x/%d sz=%d cmd %d[%d]", (int)pkt->device_identifier, pkt->size,
    //    pkt->service_number, pkt->service_command, pkt->service_arg);

    if (pkt->service_number == 0x42) {
        handle_count_packet(pkt);
        return 0;
    }

    auto buf = (RxPkt *)malloc(sizeof(RxPkt) + pkt->size);
    buf->next = NULL;
    memcpy(&buf->pkt, pkt, JD_SERIAL_FULL_HEADER_SIZE + pkt->size);

    target_disable_irq();
    auto last = rxQ;
    int num = 0;
    while (last && last->next) {
        last = last->next;
        num++;
    }
    if (num < MAX_RX) {
        if (last)
            last->next = buf;
        else
            rxQ = buf;
        buf = NULL;
    }
    target_enable_irq();

    if (buf) {
        free(buf);
        return -1;
    } else {
        Event(DEVICE_ID, EVT_DATA_READY);
        return 0;
    }
}

extern "C" void app_packet_sent(jd_packet_t *pkt) {
    // LOG("pkt sent");
    free(pkt);
    queue_cnt();
}

extern "C" void app_packet_dropped(jd_packet_t *pkt) {
    // LOG("pkt dropped!");
    free(pkt);
}

/**
 * Gets the physical layer component id
 **/
//%
int __physId() {
    return DEVICE_ID_JACDAC;
}

/**
 * Write a buffer to the jacdac physical layer.
 **/
//%
void __physSendPacket(Buffer buf) {
    if (!buf || buf->length < 16)
        return;
    int sz = JD_SERIAL_FULL_HEADER_SIZE + buf->data[2];
    auto copy = (jd_packet_t *)malloc(sz);
    if (sz > buf->length) {
        memset(copy, 0, sz);
        sz = buf->length; // this shouldn't really happen
    }
    memcpy(copy, buf->data, sz);

    // copy-out CRC
    jd_compute_crc(copy);
    memcpy(buf->data, copy, 2);

    jd_queue_packet(copy);
}

/**
 * Reads a packet from the queue. NULL if queue is empty
 **/
//%
Buffer __physGetPacket() {
    if (!rxQ)
        return NULL;

    target_disable_irq();
    auto buf = rxQ;
    if (buf)
        rxQ = buf->next;
    target_enable_irq();

    if (!buf)
        return NULL;

    auto res = mkBuffer(&buf->pkt, buf->pkt.size + JD_SERIAL_FULL_HEADER_SIZE);
    free(buf);
    return res;
}

/**
 * Returns the connection state of the JACDAC physical layer.
 **/
//%
bool __physIsConnected() {
    return jd_is_running() != 0;
}

/**
 * Indicates if the bus is running
 **/
//%
bool __physIsRunning() {
    return jd_is_running() != 0;
}

/**
 * Starts the JACDAC physical layer.
 **/
//%
void __physStart() {
    jd_init();
}

/**
 * Reads the diagnostics struct provided by the physical layer. Returns a buffer or NULL.
 **/
//%
Buffer __physGetDiagnostics() {
    if (!jd_is_running())
        return NULL;
    return mkBuffer(jd_get_diagnostics(), sizeof(jd_diagnostics_t));
}

/**
 * Stops the JACDAC physical layer.
 **/
//%
void __physStop() {
    if (!jd_is_running())
        return;                 // nothing to do
    target_panic(PANIC_JACDAC); // not supported
}

} // namespace jacdac
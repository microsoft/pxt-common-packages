#include "pxt.h"
#include "jdlow.h"

// #define COUNT_SERVICE 1

#define LOG(msg, ...) DMESG("JDAPP: " msg, ##__VA_ARGS__)
//#define LOG(...) ((void)0)

#define DEVICE_ID DEVICE_ID_JACDAC

#define EVT_DATA_READY 1
#define EVT_QUEUE_ANNOUNCE 100

namespace jacdac {

struct LinkedFrame {
    LinkedFrame *next;
    jd_frame_t frame;
};

#define MAX_RX 10
#define MAX_TX 10
static LinkedFrame *volatile rxQ;
static LinkedFrame *volatile txQ;
static LinkedFrame *superFrameRX;

extern "C" jd_frame_t *app_pull_frame() {
    target_disable_irq();
    jd_frame_t *res = NULL;
    if (txQ) {
        res = &txQ->frame;
        txQ = txQ->next;
    }
    target_enable_irq();
    return res;
}

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

static void handle_count_packet(jd_packet_t *frame) {
    numPkts++;
    count_service_pkt_t *cs = (count_service_pkt_t *)frame;
    uint32_t c = cs->count;
    if (prevCnt && prevCnt + 1 != c) {
        log_pin_set(2, 1);
        numErrors++;
        if ((numErrors & 0x1f) == 0)
            DMESG("ERR %d/%d %d snt:%d", numErrors, numPkts, numErrors * 10000 / numPkts, numSent);
        else
            DMESG("CNT-ERR");
        log_pin_set(2, 0);
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

static inline int copyAndAppend(LinkedFrame *volatile *q, jd_frame_t *frame, int max,
                                uint8_t *data = NULL) {
    auto buf = (LinkedFrame *)malloc(JD_FRAME_SIZE(frame) + sizeof(void *));

    if (data) {
        memcpy(&buf->frame, frame, JD_SERIAL_FULL_HEADER_SIZE);
        memcpy(&buf->frame.data[4], data, JD_FRAME_SIZE(frame) - JD_SERIAL_FULL_HEADER_SIZE);
        jd_compute_crc(&buf->frame);
        frame->crc = buf->frame.crc;
    } else {
        memcpy(&buf->frame, frame, JD_FRAME_SIZE(frame));
    }

    target_disable_irq();
    auto last = *q;
    int num = 0;
    buf->next = NULL;
    while (last && last->next) {
        last = last->next;
        num++;
    }
    if (num < max) {
        if (last)
            last->next = buf;
        else
            *q = buf;
        buf = NULL;
    }
    target_enable_irq();

    if (buf == NULL) {
        return 0;
    } else {
        free(buf);
        return -1;
    }
}

extern "C" int app_handle_frame(jd_frame_t *frame) {
    // DMESG("PKT from %x/%d sz=%d cmd %x", (int)frame->device_identifier,
    // frame->service_number,
    //      frame->size, frame->service_command);

    if (((jd_packet_t *)frame)->service_number == 0x42) {
        handle_count_packet((jd_packet_t *)frame);
        return 0;
    }

    if (copyAndAppend(&rxQ, frame, MAX_RX) < 0) {
        return -1;
    } else {
        Event(DEVICE_ID, EVT_DATA_READY);
        return 0;
    }
}

extern "C" void app_frame_sent(jd_frame_t *frame) {
    // LOG("frame sent");
    free((uint8_t *)frame - sizeof(void *));
    if (txQ)
        jd_packet_ready();
    queue_cnt();
}

/**
 * Gets the physical layer component id
 **/
//%
int __physId() {
    return DEVICE_ID;
}

/**
 * Write a buffer to the jacdac physical layer.
 **/
//%
void __physSendPacket(Buffer header, Buffer data) {
    if (!header || header->length != JD_SERIAL_FULL_HEADER_SIZE)
        jd_panic();

    jd_frame_t *frame = (jd_frame_t *)header->data;
    frame->size = (data->length + 4 + 3) & ~3;

    if (copyAndAppend(&txQ, frame, MAX_TX, data->data) < 0)
        return;

    jd_packet_ready();
}

/**
 * Reads a packet from the queue. NULL if queue is empty
 **/
//%
Buffer __physGetPacket() {
    if (superFrameRX && jd_shift_frame(&superFrameRX->frame) == 0) {
        free(superFrameRX);
        superFrameRX = NULL;
    }

    if (!superFrameRX && rxQ) {
        target_disable_irq();
        if ((superFrameRX = rxQ) != NULL)
            rxQ = rxQ->next;
        target_enable_irq();
    }

    if (!superFrameRX)
        return NULL;

    auto pkt = (jd_packet_t *)&superFrameRX->frame;
    return mkBuffer(pkt, JD_SERIAL_FULL_HEADER_SIZE + pkt->service_size);
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
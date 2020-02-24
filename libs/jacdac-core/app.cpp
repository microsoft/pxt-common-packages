#include "pxt.h"
#include "jdlow.h"

#define LOG(msg, ...) DMESG("JDAPP: " msg, ##__VA_ARGS__)
//#define LOG(...) ((void)0)

static uint32_t prevCnt;
uint32_t numErrors, numPkts, numSent;

struct test_ann {
    jd_header_t hd;
    uint32_t data;
};

uint64_t device_id() {
    return 0x65646f43656b614d;
}

typedef struct {
    jd_header_t hd;
    uint32_t count;
} count_service_pkt_t;

static count_service_pkt_t cnt;

static void queue_cnt() {
    if (jd_get_num_pending_tx() <= 0) {
        cnt.count++;
        cnt.hd.size = 4;
        cnt.hd.device_identifier = device_id();
        cnt.hd.service_number = 255;
        auto s = new count_service_pkt_t;
        *s = cnt;
        numSent++;
        jd_queue_packet(&s->hd);
    }
}

void app_queue_annouce() {
    LOG("announce");
    queue_cnt();
    auto p = new test_ann;
    memset(p, 0, sizeof(*p));
    p->hd.device_identifier = device_id();
    p->hd.size = 4;
    p->data = 0x0badbeef;
    jd_queue_packet(&p->hd);
}


static void signal_error() {
    log_pin_set(2, 1);
    log_pin_set(2, 0);
}

void app_handle_packet(jd_header_t *pkt) {
    // LOG("PKT from %x/%d sz=%d cmd %d[%d]", (int)pkt->device_identifier, pkt->size,
    //    pkt->service_number, pkt->service_command, pkt->service_arg);

    if (pkt->service_number == 255) {
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
}

void app_packet_sent(jd_header_t *pkt) {
    // LOG("pkt sent");
    free(pkt);
    queue_cnt();
}

void app_packet_dropped(jd_header_t *pkt) {
    // LOG("pkt dropped!");
    free(pkt);
}

namespace pxt {

//%
void startJD() {
    jd_init();
}

} // namespace pxt
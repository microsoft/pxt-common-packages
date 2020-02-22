#include "pxt.h"
#include "jdlow.h"

#define LOG(msg, ...) DMESG("JDAPP: " msg, ##__VA_ARGS__)
//#define LOG(...) ((void)0)

void app_packet_sent(jd_header_t *pkt) {
    // LOG("pkt sent");
    free(pkt);
}

void app_packet_dropped(jd_header_t *pkt) {
    // LOG("pkt dropped!");
    free(pkt);
}

struct test_ann {
    jd_header_t hd;
    uint32_t data;
};

void app_queue_annouce() {
    LOG("announce");
    auto p = new test_ann;
    memset(p, 0, sizeof(*p));
    p->hd.device_identifier = 0xdeadf00d;
    p->hd.size = 4;
    p->data = 0x0badbeef;
    jd_queue_packet(&p->hd);
}

void app_handle_packet(jd_header_t *pkt) {
    LOG("PKT from %x/%d sz=%d cmd %d[%d]", (int)pkt->device_identifier, pkt->size,
        pkt->service_number, pkt->service_command, pkt->service_arg);
}

namespace pxt {

//%
void startJD() {
    jd_init();
}

} // namespace pxt
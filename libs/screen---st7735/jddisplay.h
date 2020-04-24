#ifndef __JDDISPLAY_H
#define __JDDISPLAY_H

#include "pxt.h"
#include "jdprotocol.h"
#include "jdarcade.h"

namespace pxt {

class JDDisplay {
    jd_display_set_window_t addr;
    SPI *spi;
    Pin *cs;
    Pin *flow;
    uint32_t dataLeft;
    const uint8_t *dataPtr;
    uint32_t *palette;
    jd_frame_t sendFrame;
    jd_frame_t recvFrame;
    uint8_t bytesPerTransfer;
    bool inProgress;
    volatile bool stepWaiting;
    uint8_t displayServiceNum;
    uint8_t controlsServiceNum;
    uint32_t buttonState;
    jd_display_advertisement_data_t displayAd;

    void *queuePkt(uint32_t service_num, uint32_t service_cmd, uint32_t size);
    void flushSend();
    void step();
    void sendDone(Event);
    static void stepStatic(void *);
    void onFlowHi(Event);
    void handleIncoming(jd_packet_t *pkt);

  public:
    uint8_t brightness;
    JDDisplay(SPI *spi, Pin *cs, Pin *flow);
    void setAddrWindow(int x, int y, int w, int h) {
        addr.x = x;
        addr.y = y;
        addr.width = w;
        addr.height = h;
    }
    void waitForSendDone();

    int sendIndexedImage(const uint8_t *src, unsigned width, unsigned height, uint32_t *palette);
};

} // namespace pxt

#endif

#include "pxt.h"
#include "jddisplay.h"

#define VLOG NOLOG
//#define VLOG DMESG

namespace pxt {

JDDisplay::JDDisplay(SPI *spi, Pin *cs, Pin *flow) : spi(spi), cs(cs), flow(flow) {
    inProgress = false;
    stepWaiting = false;
    displayServiceNum = 0;
    controlsServiceNum = 0;
    buttonState = 0;
    queuePtr = 0;
    brightness = 100;
    EventModel::defaultEventBus->listen(DEVICE_ID_DISPLAY, 4243, this, &JDDisplay::sendDone);

    flow->getDigitalValue(PullMode::Down);
    EventModel::defaultEventBus->listen(flow->id, DEVICE_PIN_EVENT_ON_EDGE, this,
                                        &JDDisplay::onFlowHi, MESSAGE_BUS_LISTENER_IMMEDIATE);
    flow->eventOn(DEVICE_PIN_EVT_RISE);
}

void JDDisplay::waitForSendDone() {
    if (inProgress)
        fiber_wait_for_event(DEVICE_ID_DISPLAY, 4242);
}

void JDDisplay::sendDone(Event) {
    inProgress = false;
    Event(DEVICE_ID_DISPLAY, 4242);
}

void *JDDisplay::queuePkt(uint32_t service_num, uint32_t service_cmd, uint32_t size) {
    if (size > sizeof(pktBuffer) - queuePtr - JDSPI_HEADER_SIZE)
        target_panic(PANIC_SCREEN_ERROR);
    auto hd = (jd_spi_packet_t *)(pktBuffer + queuePtr);
    hd->pkt.size = size;
    hd->pkt.service_flags = 0;
    hd->pkt.service_number = service_num;
    hd->pkt.service_command = service_cmd;
    hd->magic = JDSPI_MAGIC;

    queuePtr += size + JDSPI_HEADER_SIZE;
    if (queuePtr <= sizeof(pktBuffer) - 4) {
        auto nexthd = (jd_spi_packet_t *)(pktBuffer + queuePtr);
        nexthd->magic = 0; // make sure next packet is not marked as valid
    }

    return hd->data;
}

void JDDisplay::flushSend() {
    if (cs)
        cs->setDigitalValue(0);
    queuePtr = 0;
    spi->startTransfer(pktBuffer, sizeof(pktBuffer), recvBuffer, sizeof(recvBuffer),
                       &JDDisplay::stepStatic, this);
}

void JDDisplay::stepStatic(void *p) {
    ((JDDisplay *)p)->step();
}

// We assume EIC IRQ pre-empts SPI/DMA IRQ (that is the numerical priority value of EIC is lower)
// This is true for codal STM32, SAMD, and NRF52
void JDDisplay::onFlowHi(Event) {
    if (stepWaiting)
        step();
}

static const int INTERNAL_KEY_UP = 2050;
static const int INTERNAL_KEY_DOWN = 2051;

void JDDisplay::handleIncoming(jd_packet_t *pkt) {
    if (pkt->service_number == 0) {
        jd_service_information_t serv;
        auto src = pkt->data;
        auto devFlags = *src++;
        if (devFlags & JD_DEVICE_FLAGS_HAS_NAME) {
            int len = *src++;
            char devname[len + 1];
            memcpy(devname, src, len);
            src += len;
            devname[len] = 0;
            VLOG("JDA: device %s", devname);
        }
        auto endp = pkt->data + pkt->size;
        uint8_t servIdx = 1;
        while (src < endp) {
            memcpy(&serv, src, sizeof(serv));
            if (serv.service_class == JD_SERVICE_CLASS_DISPLAY) {
                displayServiceNum = servIdx;
                memcpy(&displayAd, src + JD_SERVICE_INFO_SIZE, sizeof(displayAd));
                VLOG("JDA: found screen %dx%d at %dbpp flags:%x", displayAd.width, displayAd.height,
                     displayAd.bpp, displayAd.flags);
                // validate?
            } else if (serv.service_class == JD_SERVICE_CLASS_ARCADE_CONTROLS) {
                controlsServiceNum = servIdx;
                jd_arcade_controls_advertisement_data_t ad;
                memcpy(&ad, src + JD_SERVICE_INFO_SIZE, sizeof(ad));
                VLOG("JDA: found controls, %d player(s), flags:%x", ad.numplayers, ad.flags);
            } else {
                VLOG("JDA: unknown service: %x", serv.service_class);
            }
            src += serv.advertisement_size + JD_SERVICE_INFO_SIZE;
            servIdx++;
        }
    } else if (pkt->service_number == controlsServiceNum) {
        auto report = (jd_arcade_controls_report_entry_t *)pkt->data;
        auto endp = pkt->data + pkt->size;
        uint32_t state = 0;

        while ((uint8_t *)report < endp) {
            int idx = 0;
            int b = report->button;

            if (report->pressure < 0x20)
                continue;

            if (b == JD_ARCADE_CONTROLS_BUTTON_MENU2)
                b = JD_ARCADE_CONTROLS_BUTTON_MENU;

            if (b == JD_ARCADE_CONTROLS_BUTTON_RESET || b == JD_ARCADE_CONTROLS_BUTTON_EXIT)
                target_reset();

            if (1 <= b && b <= 7) {
                idx = b + 7 * report->player_index;
            }

            if (idx > 0)
                state |= 1 << idx;

            report++;
        }

        if (state != buttonState) {
            for (int i = 0; i < 32; ++i) {
                if ((state & (1 << i)) && !(buttonState & (1 << i)))
                    Event(INTERNAL_KEY_DOWN, i);
                if (!(state & (1 << i)) && (buttonState & (1 << i)))
                    Event(INTERNAL_KEY_UP, i);
            }
            buttonState = state;
        }
    } else if (pkt->service_number == 0xff) {
        // no-op packet, ignore
    } else {
        // TODO remove later
        VLOG("JDA: unknown packet for %d", pkt->service_number);
    }
}

void JDDisplay::step() {
    if (cs)
        cs->setDigitalValue(1);

    target_disable_irq();
    if (!flow->getDigitalValue()) {
        stepWaiting = true;
        target_enable_irq();
        return;
    } else {
        stepWaiting = false;
    }
    target_enable_irq();

    auto pkt = (jd_spi_packet_t *)recvBuffer;
    if (pkt->magic != JDSPI_MAGIC) {
        DMESG("JDA: magic mismatch %x", pkt->magic);
    } else {
        while (pkt->magic == JDSPI_MAGIC) {
            handleIncoming(&pkt->pkt);
            pkt = (jd_spi_packet_t *)(pkt->data + ((pkt->pkt.size + 3) & ~3));
            if ((uint8_t *)pkt > recvBuffer + sizeof(recvBuffer) - 4)
                break;
        }
    }

    if (displayServiceNum == 0) {
        // poke the control service to enumerate
        queuePkt(0, 0, 0);
        flushSend();
        return;
    }

    if (palette) {
        {
            auto cmd = (jd_display_palette_t *)queuePkt(displayServiceNum, JD_DISPLAY_CMD_PALETTE,
                                                        sizeof(jd_display_palette_t));
            memcpy(cmd->palette, palette, sizeof(jd_display_palette_t));
            palette = NULL;
        }
        {
            auto cmd = (jd_display_set_window_t *)queuePkt(
                displayServiceNum, JD_DISPLAY_CMD_SET_WINDOW, sizeof(jd_display_set_window_t));
            *cmd = this->addr;
        }
        {
            auto cmd = (jd_display_brightness_t *)queuePkt(
                displayServiceNum, JD_DISPLAY_CMD_SET_BRIGHTNESS, sizeof(jd_display_brightness_t));
            cmd->level = this->brightness * 0xffff / 100;
        }
        flushSend();
        return;
    }

    if (dataLeft > 0) {
        uint32_t transfer = bytesPerTransfer;
        if (dataLeft < transfer)
            transfer = dataLeft;
        auto pixels = queuePkt(displayServiceNum, JD_DISPLAY_CMD_PIXELS, transfer);
        memcpy(pixels, dataPtr, transfer);
        dataPtr += transfer;
        dataLeft -= transfer;
        flushSend();
    } else {
        // trigger sendDone(), which executes outside of IRQ context, so there
        // is no race with waitForSendDone
        Event(DEVICE_ID_DISPLAY, 4243);
    }
}

int JDDisplay::sendIndexedImage(const uint8_t *src, unsigned width, unsigned height,
                                uint32_t *palette) {
    if (height & 1 || !height || !width)
        target_panic(PANIC_SCREEN_ERROR);
    if (width != addr.width || height != addr.height)
        target_panic(PANIC_SCREEN_ERROR);
    if (inProgress)
        target_panic(PANIC_SCREEN_ERROR);

    if (addr.y > displayAd.height)
        return 0; // out of range

    inProgress = true;

    int numcols = (sizeof(pktBuffer) - 16) / (height / 2);

    bytesPerTransfer = numcols * (height / 2);
    dataLeft = (height / 2) * width;
    dataPtr = src;

    this->palette = palette;

    memset(pktBuffer, 0, sizeof(pktBuffer));

    step();

    return 0;
}

} // namespace pxt
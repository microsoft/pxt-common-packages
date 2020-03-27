#include "pxt.h"
#include "jdlow.h"
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
    void *res = jd_push_in_frame(&sendFrame, service_num, service_cmd, size);
    if (res == NULL)
        target_panic(PANIC_SCREEN_ERROR);
    return res;
}

void JDDisplay::flushSend() {
    if (cs)
        cs->setDigitalValue(0);
    spi->startTransfer((uint8_t *)&sendFrame, sizeof(sendFrame), (uint8_t *)&recvFrame,
                       sizeof(recvFrame), &JDDisplay::stepStatic, this);
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

void JDDisplay::handleIncoming(jd_packet_t *pkt) {
    if (pkt->service_number == JD_SERVICE_NUMBER_CTRL &&
        pkt->service_command == JD_CMD_ADVERTISEMENT_DATA) {
        uint32_t *servptr = (uint32_t *)pkt->data;
        int numServ = pkt->service_size >> 2;
        for (uint8_t servIdx = 1; servIdx < numServ; ++servIdx) {
            uint32_t service_class = servptr[servIdx];
            if (service_class == JD_SERVICE_CLASS_DISPLAY) {
                displayServiceNum = servIdx;
                VLOG("JDA: found screen, serv=%d", servIdx);
            } else if (service_class == JD_SERVICE_CLASS_ARCADE_CONTROLS) {
                controlsServiceNum = servIdx;
                VLOG("JDA: found controls, serv=%d", servIdx);
            } else {
                VLOG("JDA: unknown service: %x", service_class);
            }
        }
    } else if (pkt->service_number == JD_SERVICE_NUMBER_CTRL &&
               pkt->service_command == JD_CMD_CTRL_NOOP) {
        // do nothing
    } else if (pkt->service_number == controlsServiceNum &&
               pkt->service_command == (JD_CMD_GET_REG | JD_REG_READING)) {
        auto report = (jd_arcade_controls_report_entry_t *)pkt->data;
        auto endp = pkt->data + pkt->service_size;
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
                    Event(PXT_INTERNAL_KEY_DOWN, i);
                if (!(state & (1 << i)) && (buttonState & (1 << i)))
                    Event(PXT_INTERNAL_KEY_UP, i);
            }
            buttonState = state;
        }
    } else {
        // TODO remove later
        VLOG("JDA: unknown packet for %d (cmd=%x)", pkt->service_number, pkt->service_command);
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

    memset(&sendFrame, 0, JD_SERIAL_FULL_HEADER_SIZE);
    sendFrame.crc = JDSPI_MAGIC;
    sendFrame.device_identifier = pxt::getLongSerialNumber();

    if (recvFrame.crc == JDSPI_MAGIC_NOOP) {
        // empty frame, skip
    } else if (recvFrame.crc != JDSPI_MAGIC) {
        DMESG("JDA: magic mismatch %x", (int)recvFrame.crc);
    } else if (recvFrame.size == 0) {
        // empty frame, skip
    } else {
        for (;;) {
            handleIncoming((jd_packet_t *)&recvFrame);
            if (!jd_shift_frame(&recvFrame))
                break;
        }
    }

    if (displayServiceNum == 0) {
        // poke the control service to enumerate
        queuePkt(JD_SERVICE_NUMBER_CTRL, JD_CMD_ADVERTISEMENT_DATA, 0);
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
            auto cmd = (uint8_t *)queuePkt(displayServiceNum, JD_DISPLAY_CMD_SET_BRIGHTNESS, 1);
            *cmd = this->brightness * 0xff / 100;
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

    int numcols = JD_SERIAL_PAYLOAD_SIZE / (height / 2);

    bytesPerTransfer = numcols * (height / 2);
    dataLeft = (height / 2) * width;
    dataPtr = src;

    this->palette = palette;

    memset(&sendFrame, 0, sizeof(sendFrame));

    step();

    return 0;
}

} // namespace pxt
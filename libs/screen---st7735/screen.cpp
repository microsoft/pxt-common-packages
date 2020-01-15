#include "pxt.h"
#include "ST7735.h"
#include "ILI9341.h"

#include "SPIScreenIO.h"
#ifdef STM32F4
#include "FSMCIO.h"
#endif

namespace pxt {

struct Rect {
    uint16_t x;
    uint16_t y;
    uint16_t width;
    uint16_t height;
};

class SmartDisplay {
    Rect addr;
    SPI *spi;
    Pin *cs;
    Pin *flow;
    uint32_t dataLeft;
    const uint8_t *dataPtr;
    uint32_t *palette;
    uint8_t pktBuffer[252];
    uint8_t recvBuffer[252];
    uint8_t bytesPerTransfer;
    bool inProgress;
    bool addrSent;
    volatile bool stepWaiting;

    void sendPkt(uint32_t command, uint32_t size);
    void step();
    void sendDone(Event);
    static void stepStatic(void *);
    void onFlowHi(Event);

  public:
    SmartDisplay(SPI *spi, Pin *cs, Pin *flow);
    void setAddrWindow(int x, int y, int w, int h) {
        addr.x = x;
        addr.y = y;
        addr.width = w;
        addr.height = h;
    }
    void waitForSendDone() {
        if (inProgress)
            fiber_wait_for_event(DEVICE_ID_DISPLAY, 4242);
    }

    int sendIndexedImage(const uint8_t *src, unsigned width, unsigned height, uint32_t *palette);
};

class WDisplay {
  public:
    ScreenIO *io;
    ST7735 *lcd;
    SmartDisplay *smart;

    uint32_t currPalette[16];
    bool newPalette;
    bool inUpdate;

    uint8_t *screenBuf;
    Image_ lastStatus;

    uint16_t width, height;
    uint16_t displayHeight;
    uint8_t offX, offY;
    bool doubleSize;
    uint32_t palXOR;

    WDisplay() {
        uint32_t cfg2 = getConfig(CFG_DISPLAY_CFG2, 0x0);
        int conn = cfg2 >> 24;

        SPI *spi = NULL;
        if (conn == 0) {
            spi = new CODAL_SPI(*LOOKUP_PIN(DISPLAY_MOSI), *LOOKUP_PIN(DISPLAY_MISO),
                                *LOOKUP_PIN(DISPLAY_SCK));
            io = new SPIScreenIO(*spi);
        } else if (conn == 1) {
#ifdef CODAL_CREATE_PARALLEL_SCREEN_IO
            io = CODAL_CREATE_PARALLEL_SCREEN_IO(cfg2 & 0xffffff, PIN(DISPLAY_MOSI),
                                                 PIN(DISPLAY_MISO));
#else
            target_panic(PANIC_SCREEN_ERROR);
#endif
        } else {
            target_panic(PANIC_SCREEN_ERROR);
        }

        int dispTp = getConfig(CFG_DISPLAY_TYPE, DISPLAY_TYPE_ST7735);

        doubleSize = false;
        smart = NULL;

        if (dispTp == DISPLAY_TYPE_ST7735)
            lcd = new ST7735(*io, *LOOKUP_PIN(DISPLAY_CS), *LOOKUP_PIN(DISPLAY_DC));
        else if (dispTp == DISPLAY_TYPE_ILI9341) {
            lcd = new ILI9341(*io, *LOOKUP_PIN(DISPLAY_CS), *LOOKUP_PIN(DISPLAY_DC));
            doubleSize = true;
        } else if (dispTp == DISPLAY_TYPE_SMART) {
            lcd = NULL;
            smart = new SmartDisplay(spi, LOOKUP_PIN(DISPLAY_CS), LOOKUP_PIN(DISPLAY_DC));
        } else
            target_panic(PANIC_SCREEN_ERROR);

        uint32_t cfg0 = getConfig(CFG_DISPLAY_CFG0, 0x40);
        uint32_t frmctr1 = getConfig(CFG_DISPLAY_CFG1, 0x000603);
        palXOR = (cfg0 & 0x1000000) ? 0xffffff : 0x000000;
        auto madctl = cfg0 & 0xff;
        offX = (cfg0 >> 8) & 0xff;
        offY = (cfg0 >> 16) & 0xff;

        DMESG("configure screen: FRMCTR1=%p MADCTL=%p type=%d", frmctr1, madctl, dispTp);

        if (spi) {
            auto freq = (cfg2 & 0xff);
            if (!freq)
                freq = 15;
            spi->setFrequency(freq * 1000000);
            spi->setMode(0);
            auto cs = LOOKUP_PIN(DISPLAY_CS);
            if (cs)
                cs->setDigitalValue(1);

            // make sure the SPI peripheral is initialized before toggling reset
            spi->write(0);
        }

        auto rst = LOOKUP_PIN(DISPLAY_RST);
        if (rst) {
            rst->setDigitalValue(0);
            fiber_sleep(20);
            rst->setDigitalValue(1);
            fiber_sleep(20);
        }

        auto bl = LOOKUP_PIN(DISPLAY_BL);
        if (bl) {
            bl->setDigitalValue(1);
        }

        if (lcd) {
            lcd->init();
            lcd->configure(madctl, frmctr1);
        }

        width = getConfig(CFG_DISPLAY_WIDTH, 160);
        height = getConfig(CFG_DISPLAY_HEIGHT, 128);
        displayHeight = height;
        setAddrMain();
        DMESG("screen: %d x %d, off=%d,%d", width, height, offX, offY);
        int sz = doubleSize ? (width >> 1) * (height >> 1) : width * height;
        screenBuf = (uint8_t *)app_alloc(sz / 2 + 20);

        lastStatus = NULL;
        registerGC((TValue *)&lastStatus);
        inUpdate = false;
    }

    void setAddrStatus() {
        if (lcd)
            lcd->setAddrWindow(offX, offY + displayHeight, width, height - displayHeight);
        else
            smart->setAddrWindow(offX, offY + displayHeight, width, height - displayHeight);
    }
    void setAddrMain() {
        if (lcd)
            lcd->setAddrWindow(offX, offY, width, displayHeight);
        else
            smart->setAddrWindow(offX, offY, width, displayHeight);
    }
    void waitForSendDone() {
        if (lcd)
            lcd->waitForSendDone();
        else
            smart->waitForSendDone();
    }
    int sendIndexedImage(const uint8_t *src, unsigned width, unsigned height, uint32_t *palette) {
        if (lcd)
            return lcd->sendIndexedImage(src, width, height, palette);
        else
            return smart->sendIndexedImage(src, width, height, palette);
    }
};

SINGLETON_IF_PIN(WDisplay, DISPLAY_MOSI);

//%
int setScreenBrightnessSupported() {
    auto bl = LOOKUP_PIN(DISPLAY_BL);
    if (!bl)
        return 0;
#ifdef SAMD51
    if (bl->name == PA06)
        return 0;
#endif
#ifdef NRF52_SERIES
    // PWM not implemented yet
    return 0;
#else
    return 1;
#endif
}

//%
void setScreenBrightness(int level) {
    auto bl = LOOKUP_PIN(DISPLAY_BL);
    if (!bl)
        return;

    if (level < 0)
        level = 0;
    if (level > 100)
        level = 100;

    if (level == 0)
        bl->setDigitalValue(0);
    else if (level == 100)
        bl->setDigitalValue(1);
    else {
        if (setScreenBrightnessSupported()) {
            bl->setAnalogPeriodUs(1000);
            bl->setAnalogValue(level * level * 1023 / 10000);
        }
    }
}

//%
void setPalette(Buffer buf) {
    auto display = getWDisplay();
    if (!display)
        return;

    if (48 != buf->length)
        target_panic(PANIC_SCREEN_ERROR);
    for (int i = 0; i < 16; ++i) {
        display->currPalette[i] =
            (buf->data[i * 3] << 16) | (buf->data[i * 3 + 1] << 8) | (buf->data[i * 3 + 2] << 0);
        display->currPalette[i] ^= display->palXOR;
    }
    display->newPalette = true;
}

//%
void setupScreenStatusBar(int barHeight) {
    auto display = getWDisplay();
    if (!display)
        return;
    if (!display->doubleSize) {
        display->displayHeight = display->height - barHeight;
        display->setAddrMain();
    }
}

//%
void updateScreenStatusBar(Image_ img) {
    auto display = getWDisplay();
    if (!display)
        return;

    if (!img)
        return;
    display->lastStatus = img;
}

//%
void updateScreen(Image_ img) {
    auto display = getWDisplay();
    if (!display)
        return;

    if (display->inUpdate)
        return;

    display->inUpdate = true;

    auto mult = display->doubleSize ? 2 : 1;

    if (img) {
        if (img->bpp() != 4 || img->width() * mult != display->width ||
            img->height() * mult != display->displayHeight)
            target_panic(PANIC_SCREEN_ERROR);

        // DMESG("wait for done");
        display->waitForSendDone();

        auto palette = display->currPalette;

        if (display->newPalette) {
            display->newPalette = false;
        } else {
            // smart mode always sends palette
            if (!display->smart)
                palette = NULL;
        }

        memcpy(display->screenBuf, img->pix(), img->pixLength());

        // DMESG("send");
        display->sendIndexedImage(display->screenBuf, img->width(), img->height(), palette);
    }

    if (display->lastStatus && !display->doubleSize) {
        display->waitForSendDone();
        img = display->lastStatus;
        auto barHeight = display->height - display->displayHeight;
        if (img->bpp() != 4 || barHeight != img->height() || img->width() != display->width)
            target_panic(PANIC_SCREEN_ERROR);
        memcpy(display->screenBuf, img->pix(), img->pixLength());
        display->setAddrStatus();
        display->sendIndexedImage(display->screenBuf, img->width(), img->height(), NULL);
        display->waitForSendDone();
        display->setAddrMain();
        display->lastStatus = NULL;
    }

    display->inUpdate = false;
}

//%
void updateStats(String msg) {
    // ignore...
}

struct JDSPIHeader {
    uint8_t size;
    uint8_t service_number;
    uint16_t magic;
};

#define JD_MAGIC 0x3c5e

#define SMART_SET_ADDR 0x01
#define SMART_SET_PALETTE 0x02
#define SMART_SET_PIXELS 0x03

struct CmdSetAddr {
    JDSPIHeader hd;
    uint32_t command; // SMART_SET_ADDR
    Rect rect;
};

struct CmdSetPalette {
    JDSPIHeader hd;
    uint32_t command; // SMART_SET_PALETTE
    uint32_t palette[16];
};

SmartDisplay::SmartDisplay(SPI *spi, Pin *cs, Pin *flow) : spi(spi), cs(cs), flow(flow) {
    inProgress = false;
    stepWaiting = false;
    EventModel::defaultEventBus->listen(DEVICE_ID_DISPLAY, 4243, this, &SmartDisplay::sendDone);

    flow->getDigitalValue(PullMode::Down);
    EventModel::defaultEventBus->listen(flow->id, DEVICE_PIN_EVENT_ON_EDGE, this,
                                        &SmartDisplay::onFlowHi, MESSAGE_BUS_LISTENER_IMMEDIATE);
    flow->eventOn(DEVICE_PIN_EVT_RISE);
}

void SmartDisplay::sendDone(Event) {
    inProgress = false;
    Event(DEVICE_ID_DISPLAY, 4242);
}

void SmartDisplay::sendPkt(uint32_t command, uint32_t size) {
    if (size > sizeof(pktBuffer))
        target_panic(PANIC_SCREEN_ERROR);
    if (cs)
        cs->setDigitalValue(0);
    auto hd = (JDSPIHeader *)pktBuffer;
    hd->size = size - sizeof(JDSPIHeader);
    hd->service_number = 1;
    hd->magic = JD_MAGIC;
    auto cmd = (CmdSetAddr *)pktBuffer;
    cmd->command = command;
    size = sizeof(pktBuffer);
    spi->startTransfer(pktBuffer, size, recvBuffer, size, &SmartDisplay::stepStatic, this);
}

void SmartDisplay::stepStatic(void *p) {
    ((SmartDisplay *)p)->step();
}

// We assume EIC IRQ pre-empts SPI/DMA IRQ (that is the numerical priority value of EIC is lower)
// This is true for codal STM32, SAMD, and NRF52
void SmartDisplay::onFlowHi(Event) {
    if (stepWaiting)
        step();
}

void SmartDisplay::step() {
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

    if (palette) {
        auto pal = (CmdSetPalette *)pktBuffer;
        memcpy(pal->palette, palette, 16 * sizeof(uint32_t));
        palette = NULL;
        sendPkt(SMART_SET_PALETTE, sizeof(CmdSetPalette));
        return;
    }

    if (!addrSent) {
        addrSent = true;
        auto addr = (CmdSetAddr *)pktBuffer;
        addr->rect = this->addr;
        sendPkt(SMART_SET_ADDR, sizeof(CmdSetAddr));
        return;
    }

    if (dataLeft > 0) {
        uint32_t transfer = bytesPerTransfer;
        if (dataLeft < transfer)
            transfer = dataLeft;
        memcpy(pktBuffer + sizeof(JDSPIHeader) + 4, dataPtr, transfer);
        dataPtr += transfer;
        dataLeft -= transfer;
        sendPkt(SMART_SET_PIXELS, transfer + sizeof(JDSPIHeader) + 4);
    } else {
        // trigger sendDone(), which executes outside of IRQ context, so there
        // is no reace with waitForSendDone
        Event(DEVICE_ID_DISPLAY, 4243);
    }
}

int SmartDisplay::sendIndexedImage(const uint8_t *src, unsigned width, unsigned height,
                                   uint32_t *palette) {
    if (height & 1 || !height || !width)
        target_panic(PANIC_SCREEN_ERROR);
    if (width != addr.width || height != addr.height)
        target_panic(PANIC_SCREEN_ERROR);
    if (inProgress)
        target_panic(PANIC_SCREEN_ERROR);

    inProgress = true;
    addrSent = false;

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
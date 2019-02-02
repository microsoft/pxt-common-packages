#include "pxt.h"
#include "ST7735.h"

namespace pxt {

class WDisplay {
  public:
    CODAL_SPI spi;
    ST7735 lcd;

    uint32_t currPalette[16];
    bool newPalette;
    bool inUpdate;

    uint8_t *screenBuf;
    Image_ lastStatus;

    uint16_t width, height;
    uint16_t displayHeight;
    uint8_t offX, offY;
    uint32_t palXOR;

    WDisplay()
        : spi(*LOOKUP_PIN(DISPLAY_MOSI), *LOOKUP_PIN(DISPLAY_MISO), *LOOKUP_PIN(DISPLAY_SCK)),
          lcd(spi, *LOOKUP_PIN(DISPLAY_CS), *LOOKUP_PIN(DISPLAY_DC)) {

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

        uint32_t cfg0 = getConfig(CFG_DISPLAY_CFG0, 0x40);
        uint32_t cfg2 = getConfig(CFG_DISPLAY_CFG2, 0x0);
        uint32_t frmctr1 = getConfig(CFG_DISPLAY_CFG1, 0x000603);
        palXOR = (cfg0 & 0x1000000) ? 0xffffff : 0x000000;
        auto madctl = cfg0 & 0xff;
        offX = (cfg0 >> 8) & 0xff;
        offY = (cfg0 >> 16) & 0xff;
        auto freq = (cfg2 & 0xff);
        if (!freq)
            freq = 15;

        DMESG("configure screen: FRMCTR1=%p MADCTL=%p SPI at %dMHz", frmctr1, madctl, freq);

        spi.setFrequency(freq * 1000000);
        spi.setMode(0);
        lcd.init();
        lcd.configure(madctl, frmctr1);
        width = getConfig(CFG_DISPLAY_WIDTH, 160);
        height = getConfig(CFG_DISPLAY_HEIGHT, 128);
        displayHeight = height;
        lcd.setAddrWindow(offX, offY, width, height);
        DMESG("screen: %d x %d, off=%d,%d", width, height, offX, offY);
        screenBuf = (uint8_t *)app_alloc(width * height / 2 + 20);

        lastStatus = NULL;
        registerGC((TValue *)&lastStatus);
        inUpdate = false;
    }

    void setAddrStatus() {
        lcd.setAddrWindow(offX, offY + displayHeight, width, height - displayHeight);
    }
    void setAddrMain() { lcd.setAddrWindow(offX, offY, width, displayHeight); }
};

SINGLETON(WDisplay);

//%
void setPalette(Buffer buf) {
    auto display = getWDisplay();
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
    display->displayHeight = display->height - barHeight;
    display->setAddrMain();
}

//%
void updateScreenStatusBar(Image_ img) {
    auto display = getWDisplay();
    if (!img)
        return;
    display->lastStatus = img;
}

//%
void updateScreen(Image_ img) {
    auto display = getWDisplay();

    if (display->inUpdate)
        return;

    display->inUpdate = true;

    if (img && img->isDirty()) {
        if (img->bpp() != 4 || img->width() != display->width ||
            img->height() != display->displayHeight)
            target_panic(PANIC_SCREEN_ERROR);

        img->clearDirty();
        // DMESG("wait for done");
        display->lcd.waitForSendDone();

        auto palette = display->currPalette;

        if (display->newPalette) {
            display->newPalette = false;
        } else {
            palette = NULL;
        }

        memcpy(display->screenBuf, img->pix(), img->pixLength());

        // DMESG("send");
        display->lcd.sendIndexedImage(display->screenBuf, img->width(), img->height(), palette);
    }

    if (display->lastStatus) {
        display->lcd.waitForSendDone();
        img = display->lastStatus;
        auto barHeight = display->height - display->displayHeight;
        if (img->bpp() != 4 || barHeight != img->height() || img->width() != display->width)
            target_panic(PANIC_SCREEN_ERROR);
        memcpy(display->screenBuf, img->pix(), img->pixLength());
        display->setAddrStatus();
        display->lcd.sendIndexedImage(display->screenBuf, img->width(), img->height(), NULL);
        display->lcd.waitForSendDone();
        display->setAddrMain();
        display->lastStatus = NULL;
    }

    display->inUpdate = false;
}

//%
void updateStats(String msg) {
    // ignore...
}


//%
void getUnicode(int ch, Buffer buf) {
	// this function is target dependent
    auto display = getWDisplay();
    display->lcd.waitForSendDone();
	/*
    if (!display->fsMounted){
        int ret = display->fs.mount();
        if (ret == 0){
            display->fp = display->fs.open("/unicode12.bin", 0x1);
            display->fsMounted = true;
        }
    }
    DMESG("show unicode %x", ch);
    uint32_t bias = ch*24;
    display->fp->seek(bias);
    display->fp->read(buf->data, 24);
	*/
}
} // namespace pxt
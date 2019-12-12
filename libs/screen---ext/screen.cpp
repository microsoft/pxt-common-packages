#include "pxt.h"

namespace pxt {
class WDisplay {
  public:
    uint32_t currPalette[16];
    bool newPalette, dataWaiting;
    uint8_t *screenBuf;

    int width, height;

    WDisplay();
    void updateLoop();
    void update(Image_ img);
};

SINGLETON(WDisplay);

WDisplay::WDisplay() {
    width = getConfig(CFG_DISPLAY_WIDTH, 160);
    height = getConfig(CFG_DISPLAY_HEIGHT, 128);
    DMESG("init display: %dx%d", width, height);
    screenBuf = new uint8_t[width * height / 2 + 20];
    newPalette = false;
}

//% expose
int setScreenBrightnessSupported() {
    return 0;
}

//% expose
void setScreenBrightness(int level) {
    // TODO
}

//% expose
void setPalette(Buffer buf) {
    auto display = getWDisplay();
    if (48 != buf->length)
        target_panic(PANIC_SCREEN_ERROR);
    for (int i = 0; i < 16; ++i) {
        uint8_t r = buf->data[i * 3];
        uint8_t g = buf->data[i * 3 + 1];
        uint8_t b = buf->data[i * 3 + 2];
        display->currPalette[i] = (0xff << 24) | (r << 16) | (g << 8) | (b << 0);
    }
    display->newPalette = true;
}

static pthread_mutex_t screenMutex;
static pthread_cond_t dataBroadcast;
static int numGetPixels;

DLLEXPORT void pxt_screen_get_pixels(int width, int height, uint32_t *screen) {
    auto disp = instWDisplay;
    numGetPixels++;

    if (!disp) {
        int n = width * height;
        uint32_t *p = screen;
        // blue screen
        while (n--)
            *p++ = 0xff000000;
        return;
    }

    pthread_mutex_lock(&screenMutex);
    if (!disp->dataWaiting) {
        struct timespec timeout = {0, 100 * 1000 * 1000}; // up to 100ms
        pthread_cond_timedwait(&dataBroadcast, &screenMutex, &timeout);
    }
    if (width != disp->width || height != disp->height)
        target_panic(PANIC_SCREEN_ERROR);
    if (panicCode > 0) {
        int n = width * height;
        uint32_t *p = screen;
        // blue screen
        while (n--)
            *p++ = 0xff0000ff;
    } else {
        auto sp = disp->screenBuf;
        auto pal = disp->currPalette;
        for (int x = 0; x < width; ++x) {
            uint32_t *p = screen + x;
            for (int y = 0; y < (height >> 1); ++y) {
                uint8_t v = *sp++;
                *p = pal[v & 0xf];
                p += width;
                *p = pal[v >> 4];
                p += width;
            }
        }
    }
    pthread_cond_broadcast(&dataBroadcast);
    disp->dataWaiting = false;
    pthread_mutex_unlock(&screenMutex);
}

void WDisplay::update(Image_ img) {
    if (!img)
        return;

    if (img->bpp() != 4 || img->width() != width || img->height() != height)
        target_panic(PANIC_SCREEN_ERROR);

    pthread_mutex_lock(&screenMutex);
    // if the data have not been picked up, but it had been in the past, wait
    if (dataWaiting && numGetPixels)
        pthread_cond_wait(&dataBroadcast, &screenMutex);
    memcpy(screenBuf, img->pix(), img->pixLength());
    dataWaiting = true;
    pthread_cond_broadcast(&dataBroadcast);
    pthread_mutex_unlock(&screenMutex);

    if (newPalette) {
        newPalette = false;
    }
}

//% expose
void updateScreen(Image_ img) {
    getWDisplay()->update(img);
}

//% expose
void updateStats(String msg) {
    DMESG("stats: %s", msg->getUTF8Data());
}
} // namespace pxt
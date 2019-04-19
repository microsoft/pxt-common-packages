#include "pxt.h"


namespace pxt {
class WDisplay {
  public:
    uint32_t currPalette[16];
    bool newPalette, dataWaiting;

    uint8_t *screenBuf;
    Image_ lastImg;

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
    lastImg = NULL;
    newPalette = false;

    registerGC((TValue *)&lastImg);
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
        display->currPalette[i] = (0xff << 24) | (r << 0) | (g << 8) | (b << 16);
    }
    display->newPalette = true;
}

static pthread_mutex_t screenMutex;
static pthread_cond_t dataBroadcast;

DLLEXPORT void pxt_screen_get_pixels(int width, int height, uint32_t *screen)
{
    auto disp = getWDisplay();

    pthread_mutex_lock(&screenMutex);
    if (!disp->dataWaiting)
        pthread_cond_wait(&dataBroadcast, &screenMutex);
    disp->dataWaiting = false;
    if (width != disp->width || height != disp->height)
        target_panic(PANIC_SCREEN_ERROR);
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
    pthread_mutex_unlock(&screenMutex);
}

void performUpdate(uint8_t *screenBuf, uint32_t *palette) {
    // do something
}

void WDisplay::update(Image_ img) {
    if (img && img != lastImg) {
        lastImg = img;
    }
    img = lastImg;

    if (img && img->isDirty()) {
        if (img->bpp() != 4 || img->width() != width || img->height() != height)
            target_panic(PANIC_SCREEN_ERROR);

        img->clearDirty();

        pthread_mutex_lock(&screenMutex);
        memcpy(screenBuf, img->pix(), img->pixLength());
        dataWaiting = true;
        pthread_cond_broadcast(&dataBroadcast);
        pthread_mutex_unlock(&screenMutex);

        performUpdate(screenBuf, currPalette);

        if (newPalette) {
            newPalette = false;
        }
    }
}

//% expose
void updateScreen(Image_ img) {
    getWDisplay()->update(img);
}

//% expose
void updateStats(String msg) {
    // DMESG("render: %s", msg->data);
}
} // namespace pxt
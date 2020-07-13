#include "pxt.h"

namespace pxt {
class WDisplay {
  public:
    uint8_t currPalette[16];
    Image_ lastImg;

    int width, height;

    WDisplay();
    void updateLoop();
    void update(Image_ img);
};

SINGLETON(WDisplay);

WDisplay::WDisplay() {
    width = 160;
    height = 120;
    lastImg = NULL;
    registerGC((TValue *)&lastImg);
}

//%
int setScreenBrightnessSupported() {
    return 0;
}

//%
void setScreenBrightness(int level) {
    // TODO
}

static const uint8_t grays[] = {
    0b0000, 0b0001, 0b0010, 0b0100, 0b1000, 0b1001, 0b0110, 0b1100,
    0b0011, 0b0101, 0b1010, 0b1101, 0b1110, 0b0101, 0b0111, 0b1111,
};

//%
void setPalette(Buffer buf) {
    auto display = getWDisplay();
    if (48 != buf->length)
        target_panic(PANIC_SCREEN_ERROR);
    for (int i = 0; i < 16; ++i) {
        uint8_t r = buf->data[i * 3];
        uint8_t g = buf->data[i * 3 + 1];
        uint8_t b = buf->data[i * 3 + 2];
        display->currPalette[i] = grays[(r + g + g + b) * sizeof(grays) / 1024];
    }
}

#define ROW_BYTES 52
#define NUM_ROWS 240

void WDisplay::update(Image_ img) {
    if (img && img != lastImg) {
        lastImg = img;
    }
    img = lastImg;

    if (img) {
        if (img->bpp() != 4 || img->width() != width || img->height() != height)
            target_panic(PANIC_SCREEN_ERROR);

        uint8_t *frame = playdate->graphics->getFrame();
        memset(frame, 0, ROW_BYTES * NUM_ROWS);
        uint8_t *src = img->pix();
        uint32_t w = img->width(), h = img->height();
        for (unsigned x = 0; x < w; ++x) {
            uint8_t *dst = frame + x / 4;
            uint32_t shift = (3 - (x % 4)) * 2;
            for (unsigned y = 0; y < h; y += 2) {
                uint8_t inp = *src++;
                uint32_t col = currPalette[inp & 0xf];
                *dst |= (col & 3) << shift;
                dst += ROW_BYTES;
                *dst |= ((col >> 2) & 3) << shift;
                dst += ROW_BYTES;
                col = currPalette[inp >> 4];
                *dst |= (col & 3) << shift;
                dst += ROW_BYTES;
                *dst |= ((col >> 2) & 3) << shift;
                dst += ROW_BYTES;
            }
        }
    }
}

//%
void updateScreen(Image_ img) {
    getWDisplay()->update(img);
}

//%
void updateStats(String msg) {
    // DMESG("render: %s", msg->data);
}
} // namespace pxt
#include "pxt.h"
#include "pins.h"

#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <linux/fb.h>
#include <linux/kd.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <pthread.h>

namespace pxt {
class WDisplay {
  public:
    uint32_t currPalette[16];
    bool newPalette;
    volatile bool painted;

    uint8_t *screenBuf;
    Image_ lastImg;

    int width, height;

    int fb_fd;
    uint32_t *fbuf;
    struct fb_fix_screeninfo finfo;
    struct fb_var_screeninfo vinfo;

    int eventId;

    pthread_mutex_t mutex;

    WDisplay();
    void updateLoop();
    void update(Image_ img);
};

SINGLETON(WDisplay);

static void *updateDisplay(void *wd) {
    ((WDisplay *)wd)->updateLoop();
    return NULL;
}

void WDisplay::updateLoop() {
    int cur_page = 1;

    int sx = vinfo.xres / width;
    int sy = vinfo.yres / height;
    if (sx > sy)
        sx = sy;
    else
        sy = sx;

    int offx = (vinfo.xres - width * sx) / 2;
    int screensize = finfo.line_length * vinfo.yres;

    for (;;) {
        pthread_mutex_lock(&mutex);
        uint32_t *dst = fbuf + cur_page * screensize / 4 + offx;
        uint32_t skip = offx * 2;
        for (int yy = 0; yy < height; yy++) {
            auto shift = yy & 1 ? 4 : 0;
            for (int i = 0; i < sy; ++i) {
                auto src = screenBuf + yy / 2;
                for (int xx = 0; xx < width; ++xx) {
                    int c = this->currPalette[(*src >> shift) & 0xf];
                    src += height / 2;
                    for (int j = 0; j < sx; ++j)
                        *dst++ = c;
                }
                dst += skip;
            }
        }
        pthread_mutex_unlock(&mutex);

        painted = true;
        raiseEvent(DEVICE_ID_NOTIFY_ONE, eventId);

        vinfo.yoffset = cur_page * vinfo.yres;
        ioctl(fb_fd, FBIOPAN_DISPLAY, &vinfo);
        ioctl(fb_fd, FBIO_WAITFORVSYNC, 0);
        cur_page = !cur_page;
    }
}

WDisplay::WDisplay() {
    pthread_mutex_init(&mutex, NULL);

    width = getConfig(CFG_DISPLAY_WIDTH, 160);
    height = getConfig(CFG_DISPLAY_HEIGHT, 128);
    screenBuf = new uint8_t[width * height / 2 + 20];
    lastImg = NULL;
    newPalette = false;

    eventId = allocateNotifyEvent();

    int tty_fd = open("/dev/tty0", O_RDWR);
    ioctl(tty_fd, KDSETMODE, KD_GRAPHICS);

    fb_fd = open("/dev/fb0", O_RDWR);

    if (fb_fd < 0)
        target_panic(901);

    ioctl(fb_fd, FBIOGET_FSCREENINFO, &finfo);
    ioctl(fb_fd, FBIOGET_VSCREENINFO, &vinfo);

    DMESG("FB: %s at %dx%d %dx%d bpp=%d", finfo.id, vinfo.xres, vinfo.yres, vinfo.xres_virtual,
          vinfo.yres_virtual, vinfo.bits_per_pixel);

    vinfo.yres_virtual = vinfo.yres * 2;
    vinfo.xres_virtual = vinfo.xres;
    vinfo.bits_per_pixel = 32;

    ioctl(fb_fd, FBIOPUT_VSCREENINFO, &vinfo);
    ioctl(fb_fd, FBIOGET_FSCREENINFO, &finfo);
    ioctl(fb_fd, FBIOGET_VSCREENINFO, &vinfo);

    DMESG("FB: %s at %dx%d %dx%d bpp=%d %d", finfo.id, vinfo.xres, vinfo.yres, vinfo.xres_virtual,
          vinfo.yres_virtual, vinfo.bits_per_pixel, finfo.line_length);

    fbuf = (uint32_t *)mmap(0, finfo.line_length * vinfo.yres_virtual, PROT_READ | PROT_WRITE,
                            MAP_SHARED, fb_fd, (off_t)0);

    pthread_t upd;
    pthread_create(&upd, NULL, updateDisplay, this);
    pthread_detach(upd);
}

//%
void setPalette(Buffer buf) {
    auto display = getWDisplay();
    if (48 != buf->length)
        target_panic(907);
    for (int i = 0; i < 16; ++i) {
        display->currPalette[i] =
            (buf->data[i * 3] << 16) | (buf->data[i * 3 + 1] << 8) | (buf->data[i * 3 + 2] << 0);
    }
    display->newPalette = true;
}

void WDisplay::update(Image_ img) {
    if (img && img != lastImg) {
        decrRC(lastImg);
        incrRC(img);
        lastImg = img;
    }
    img = lastImg;

    if (img && img->isDirty()) {
        if (img->bpp() != 4 || img->width() != width || img->height() != height)
            target_panic(906);

        img->clearDirty();

        if (!painted) {
            // race is possible (though very unlikely), but in such case we just
            // wait for next frame paint
            waitForEvent(DEVICE_ID_NOTIFY, eventId);
        }
        painted = false;

        pthread_mutex_lock(&mutex);
        if (newPalette) {
            newPalette = false;
        }
        memcpy(screenBuf, img->pix(), img->pixLength());
        pthread_mutex_unlock(&mutex);
    }
}

//%
void updateScreen(Image_ img) {
    getWDisplay()->update(img);
}

//%
void updateStats(String msg) {
    DMESG("render: %s", msg->data);
}
} // namespace pxt
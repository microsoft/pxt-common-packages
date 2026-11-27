#include "pxt.h"

#if IMAGE_BITS == 1
// OK
#elif IMAGE_BITS == 4
// OK
#elif IMAGE_BITS == 16
// OK
#else
#error "Invalid IMAGE_BITS"
#endif

#define XX(v) (int)(((int16_t)(v)))
#define YY(v) (int)(((int16_t)(((int32_t)(v)) >> 16)))

namespace pxt {

PXT_VTABLE(RefImage, ValType::Object)

void RefImage::destroy(RefImage *t) {}

void RefImage::print(RefImage *t) {
    DMESG("RefImage %p size=%d x %d", t, t->width(), t->height());
}

int RefImage::wordHeight() {
    if (bpp() == 1)
        oops(20);
    if (bpp() == 16)
        return ((height() * 16 + 31) >> 5);
    return ((height() * 4 + 31) >> 5);
}

void RefImage::makeWritable() {
    if (isStatic()) {
        int len = length();
        auto n = mkBuffer(NULL, len);
        memcpy(n->data, data(), len);
        buffer = n;
        registerGC((TValue *)&buffer);
    }
}

uint8_t *RefImage::pix(int x, int y) {
    return data() + x * byteHeight() + (y << 1);
}

void RefImage::clamp(int *x, int *y) {
    if (*x < 0)
        *x = 0;
    else if (*x >= width())
        *x = width() - 1;
    if (*y < 0)
        *y = 0;
    else if (*y >= height())
        *y = height() - 1;
}

bool RefImage::inRange(int x, int y) {
    return 0 <= x && x < width() && 0 <= y && y < height();
}

void RefImage::fillMask(uint32_t v) {
    makeWritable();
    uint16_t c = v & 0xFFFF;
    uint32_t val = c | ((uint32_t)c << 16);
    memset32(data(), val, length() >> 2);
}

Image_ allocImage(int w, int h, int bpp) {
    if (w < 0 || h < 0 || w > 32767 || h > 32767)
        return NULL;
    if (bpp != 16)
        bpp = 16;
    int bh = ((h * 16 + 31) >> 5) << 2;
    int len = w * bh;
    auto buf = mkBuffer(NULL, len);
    auto r = NEW_GC(RefImage);
    r->width_ = w;
    r->height_ = h;
    r->bpp_ = 16;
    r->buffer = buf;
    registerGC((TValue *)&r->buffer);
    return r;
}

} // namespace pxt

namespace ImageMethods {

//%
int width(Image_ img) {
    return img->width();
}

//%
int height(Image_ img) {
    return img->height();
}

//%
bool isMono(Image_ img) {
    return img->bpp() == 1;
}

//%
void setPixel(Image_ img, int x, int y, int c) {
    if (!img->inRange(x, y))
        return;
    img->makeWritable();
    uint16_t *p = (uint16_t *)img->pix(x, y);
    *p = c & 0xFFFF;
}

//%
int getPixel(Image_ img, int x, int y) {
    if (!img->inRange(x, y))
        return 0;
    uint16_t *p = (uint16_t *)img->pix(x, y);
    return *p & 0xFFFF;
}

//%
void fill(Image_ img, int c) {
    img->fillMask(c & 0xFFFF);
}

void fillRect(Image_ img, int x, int y, int w, int h, int c) {
    if (w <= 0 || h <= 0 || x >= img->width() || y >= img->height())
        return;

    int x2 = x + w - 1;
    int y2 = y + h - 1;

    if (x2 < 0 || y2 < 0)
        return;

    img->clamp(&x2, &y2);
    img->clamp(&x, &y);
    w = x2 - x + 1;
    h = y2 - y + 1;

    img->makeWritable();

    uint16_t color = c & 0xFFFF;
    auto bh = img->byteHeight();
    uint8_t *p = img->pix(x, y);
    while (w-- > 0) {
        uint16_t *ptr = (uint16_t *)p;
        for (int i = 0; i < h; i++) {
            *ptr++ = color;
        }
        p += bh;
    }
}

//%
void _fillRect(Image_ img, int xy, int wh, int c) {
    fillRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
}

void mapRect(Image_ img, int x, int y, int w, int h, Buffer map) {
    if (w <= 0 || h <= 0 || x >= img->width() || y >= img->height())
        return;

    if (img->bpp() != 16 || map->length < 32)
        return;

    int x2 = x + w - 1;
    int y2 = y + h - 1;

    if (x2 < 0 || y2 < 0)
        return;

    img->clamp(&x2, &y2);
    img->clamp(&x, &y);
    w = x2 - x + 1;
    h = y2 - y + 1;

    img->makeWritable();

    auto bh = img->byteHeight();
    auto m = (uint16_t *)map->data;
    int maxIdx = (map->length >> 1) - 1;
    uint8_t *p = img->pix(x, y);

    while (w-- > 0) {
        auto ptr = (uint16_t *)p;
        for (int i = 0; i < h; i++) {
            uint16_t idx = *ptr;
            if (idx <= maxIdx) {
                *ptr = m[idx];
            }
            ptr++;
        }
        p += bh;
    }
}

//%
void _mapRect(Image_ img, int xy, int wh, Buffer c) {
    mapRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
}

//% argsNullable
bool equals(Image_ img, Image_ other) {
    if (!other) {
        return false;
    }
    auto len = img->length();
    if (len != other->length()) {
        return false;
    }
    return 0 == memcmp(img->data(), other->data(), len);
}

//%
Image_ clone(Image_ img) {
    auto r = allocImage(img->width(), img->height(), 16);
    memcpy(r->data(), img->data(), img->length());
    return r;
}

//%
void replace(Image_ img, int from, int to) {
    if (from == to)
        return;
    img->makeWritable();
    uint16_t f = from & 0xFFFF;
    uint16_t t = to & 0xFFFF;
    int w = img->width();
    int h = img->height();
    auto bh = img->byteHeight();
    uint8_t *p = img->data();
    while (w-- > 0) {
        uint16_t *ptr = (uint16_t *)p;
        for (int i = 0; i < h; i++) {
            if (*ptr == f) {
                *ptr = t;
            }
            ptr++;
        }
        p += bh;
    }
}

//%
void flipX(Image_ img) {
    img->makeWritable();
    int w = img->width();
    int h = img->height();
    auto bh = img->byteHeight();
    for (int x = 0; x < w / 2; x++) {
        uint16_t *p1 = (uint16_t *)img->pix(x, 0);
        uint16_t *p2 = (uint16_t *)img->pix(w - 1 - x, 0);
        for (int y = 0; y < h; y++) {
            uint16_t tmp = p1[y];
            p1[y] = p2[y];
            p2[y] = tmp;
        }
    }
}

//%
void flipY(Image_ img) {
    img->makeWritable();
    int w = img->width();
    int h = img->height();
    auto bh = img->byteHeight();
    uint8_t *p = img->data();
    while (w-- > 0) {
        uint16_t *ptr = (uint16_t *)p;
        for (int y = 0; y < h / 2; y++) {
            uint16_t tmp = ptr[y];
            ptr[y] = ptr[h - 1 - y];
            ptr[h - 1 - y] = tmp;
        }
        p += bh;
    }
}
void drawImageCore(Image_ img, Image_ from, int x, int y, bool transparent) {
    int w = from->width();
    int h = from->height();
    int sh = img->height();
    int sw = img->width();

    if (x + w <= 0 || x >= sw || y + h <= 0 || y >= sh)
        return;

    int x0 = x < 0 ? -x : 0;
    int y0 = y < 0 ? -y : 0;
    int x1 = x + w > sw ? sw - x : w;
    int y1 = y + h > sh ? sh - y : h;

    img->makeWritable();

    auto sbh = from->byteHeight();
    auto dbh = img->byteHeight();
    uint8_t *sp = from->pix(x0, y0);
    uint8_t *dp = img->pix(x + x0, y + y0);
    int copyH = y1 - y0;

    for (int i = x0; i < x1; i++) {
        uint16_t *sptr = (uint16_t *)sp;
        uint16_t *dptr = (uint16_t *)dp;
        if (!transparent) {
            memcpy(dptr, sptr, copyH << 1);
        } else {
            for (int j = 0; j < copyH; j++) {
                uint16_t c = sptr[j];
                if (c != 0) {
                    dptr[j] = c;
                }
            }
        }
        sp += sbh;
        dp += dbh;
    }
}

//%
void drawImage(Image_ img, Image_ from, int x, int y) {
    drawImageCore(img, from, x, y, false);
}

//%
void drawTransparentImage(Image_ img, Image_ from, int x, int y) {
    drawImageCore(img, from, x, y, true);
}

//%
bool overlapsWith(Image_ img, Image_ other, int x, int y) {
    int w = other->width();
    int h = other->height();
    int sh = img->height();
    int sw = img->width();

    if (x + w <= 0 || x >= sw || y + h <= 0 || y >= sh)
        return false;

    int x0 = x < 0 ? -x : 0;
    int y0 = y < 0 ? -y : 0;
    int x1 = x + w > sw ? sw - x : w;
    int y1 = y + h > sh ? sh - y : h;

    auto sbh = other->byteHeight();
    auto dbh = img->byteHeight();
    uint8_t *sp = other->pix(x0, y0);
    uint8_t *dp = img->pix(x + x0, y + y0);
    int checkH = y1 - y0;

    for (int i = x0; i < x1; i++) {
        uint16_t *sptr = (uint16_t *)sp;
        uint16_t *dptr = (uint16_t *)dp;
        for (int j = 0; j < checkH; j++) {
            if (sptr[j] != 0 && dptr[j] != 0) {
                return true;
            }
        }
        sp += sbh;
        dp += dbh;
    }
    return false;
}

//%
void scroll(Image_ img, int dx, int dy) {
    if (dx == 0 && dy == 0)
        return;
    auto copy = clone(img);
    img->fillMask(0);
    drawImage(img, copy, dx, dy);
}

//%
Image_ create(int width, int height) {
    return allocImage(width, height, 16);
}

//%
Image_ doubledX(Image_ img) {
    int w = img->width();
    int h = img->height();
    auto r = allocImage(w * 2, h, 16);
    auto sbh = img->byteHeight();
    auto dbh = r->byteHeight();
    uint8_t *sp = img->data();
    uint8_t *dp = r->data();
    for (int x = 0; x < w; x++) {
        memcpy(dp, sp, h << 1);
        dp += dbh;
        memcpy(dp, sp, h << 1);
        dp += dbh;
        sp += sbh;
    }
    return r;
}

//%
Image_ doubledY(Image_ img) {
    int w = img->width();
    int h = img->height();
    auto r = allocImage(w, h * 2, 16);
    auto sbh = img->byteHeight();
    auto dbh = r->byteHeight();
    uint8_t *sp = img->data();
    uint8_t *dp = r->data();
    for (int x = 0; x < w; x++) {
        uint16_t *sptr = (uint16_t *)sp;
        uint16_t *dptr = (uint16_t *)dp;
        for (int y = 0; y < h; y++) {
            uint16_t c = sptr[y];
            dptr[y * 2] = c;
            dptr[y * 2 + 1] = c;
        }
        sp += sbh;
        dp += dbh;
    }
    return r;
}

//%
Image_ doubled(Image_ img) {
    return doubledY(doubledX(img));
}

} // namespace ImageMethods

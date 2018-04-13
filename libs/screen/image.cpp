#include "pxt.h"

#if IMAGE_BITS == 1
// OK
#elif IMAGE_BITS == 4
// OK
#else
#error "Invalid IMAGE_BITS"
#endif

#define XX(v) (int)(((int16_t)(v)))
#define YY(v) (int)(((int16_t)(((int32_t)(v)) >> 16)))

namespace pxt {

PXT_VTABLE_BEGIN(RefImage, 0, 0)
PXT_VTABLE_END

void RefImage::destroy(RefImage *t) {
    decrRC(t->buffer());
}

void RefImage::print(RefImage *t) {
    DMESG("RefImage %p r=%d size=%d x %d", t, t->refcnt, t->width(), t->height());
}

int RefImage::width() {
    return data()[1];
}

int RefImage::wordHeight() {
    if (bpp() == 1)
        target_panic(900);
    return ((data()[2] * bpp() + 31) >> 5);
}

int RefImage::byteHeight() {
    if (bpp() == 1)
        return (data()[2] + 7) >> 3;
    else if (bpp() == 4)
        return ((data()[2] * 4 + 31) >> 5) << 2;
    else {
        target_panic(900);
        return -1;
    }
}

int RefImage::bpp() {
    return data()[0] & 0xf;
}

int RefImage::height() {
    return data()[2];
}

void RefImage::makeWritable() {
    if (hasBuffer()) {
        if (buffer()->isReadOnly()) {
            auto b = mkBuffer(data(), length());
            decrRC(buffer());
            _buffer = (uintptr_t)b;
        }
    } else {
        _buffer |= 2;
    }
}

uint8_t *RefImage::pix(int x, int y) {
    uint8_t *d = &data()[4 + byteHeight() * x];
    if (y) {
        if (bpp() == 1)
            d += y >> 3;
        else if (bpp() == 4)
            d += y >> 1;
    }
    return d;
}

uint8_t RefImage::fillMask(color c) {
    return this->bpp() == 1 ? (c & 1) * 0xff : 0x11 * (c & 0xf);
}

bool RefImage::inRange(int x, int y) {
    return 0 <= x && x < width() && 0 <= y && y < height();
}

void RefImage::clamp(int *x, int *y) {
    *x = min(max(*x, 0), width() - 1);
    *y = min(max(*y, 0), height() - 1);
}

RefImage::RefImage(BoxedBuffer *buf) : PXT_VTABLE_INIT(RefImage), _buffer((uintptr_t)buf) {
    incrRC(buf);
}
RefImage::RefImage(uint32_t sz) : PXT_VTABLE_INIT(RefImage), _buffer((sz << 2) | 3) {}

static inline int byteSize(int w, int h, int bpp) {
    if (bpp == 1)
        return 4 + ((h + 7) >> 3) * w;
    else
        return 4 + (((h * 4 + 31) / 32) * 4) * w;
}

Image_ mkImage(int width, int height, int bpp) {
    if (width < 0 || height < 0 || width > 255 || height > 255)
        return NULL;
    if (bpp != 1 && bpp != 4)
        return NULL;
    uint32_t sz = byteSize(width, height, bpp);
    Image_ r = new (::operator new(sizeof(RefImage) + sz)) RefImage(sz);
    auto d = r->data();
    d[0] = 0xe0 | bpp;
    d[1] = width;
    d[2] = height;
    d[3] = 0;
    MEMDBG("mkImage: %d X %d => %p", width, height, r);
    return r;
}

bool isValidImage(Buffer buf) {
    if (!buf || buf->length < 5)
        return false;

    if (buf->data[0] != 0xe1 && buf->data[0] != 0xe4)
        return false;

    int sz = byteSize(buf->data[1], buf->data[2], buf->data[0] & 0xf);
    if (sz != (int)buf->length)
        return false;

    return true;
}

} // namespace pxt

namespace ImageMethods {

/**
 * Get the width of the image
 */
//% property
int width(Image_ img) {
    return img->width();
}

/**
 * Get the height of the image
 */
//% property
int height(Image_ img) {
    return img->height();
}

/**
 * True iff the image is monochromatic (black and white)
 */
//% property
bool isMono(Image_ img) {
    return img->bpp() == 1;
}

/**
 * Sets all pixels in the current image from the other image, which has to be of the same size and
 * bpp.
 */
//%
void copyFrom(Image_ img, Image_ from) {
    if (img->width() != from->width() || img->height() != from->height() ||
        img->bpp() != from->bpp())
        return;
    img->makeWritable();
    memcpy(img->pix(), from->pix(), from->pixLength());
}

static inline void setCore(Image_ img, int x, int y, int c) {
    auto ptr = img->pix(x, y);
    if (img->bpp() == 1) {
        uint8_t mask = 0x01 << (y & 7);
        if (c)
            *ptr |= mask;
        else
            *ptr &= ~mask;
    } else if (img->bpp() == 4) {
        if (y & 1)
            *ptr = (*ptr & 0x0f) | (c << 4);
        else
            *ptr = (*ptr & 0xf0) | (c & 0xf);
    }
}

/**
 * Set pixel color
 */
//%
void setPixel(Image_ img, int x, int y, int c) {
    if (!img->inRange(x, y))
        return;
    img->makeWritable();
    setCore(img, x, y, c);
}

/**
 * Get a pixel color
 */
//%
int getPixel(Image_ img, int x, int y) {
    if (!img->inRange(x, y))
        return 0;
    auto ptr = img->pix(x, y);
    if (img->bpp() == 1) {
        uint8_t mask = 0x01 << (y & 7);
        return (*ptr & mask) ? 1 : 0;
    } else if (img->bpp() == 4) {
        if (y & 1)
            return *ptr >> 4;
        else
            return *ptr & 0x0f;
    }
    return 0;
}

void fillRect(Image_ img, int x, int y, int w, int h, int c);

/**
 * Fill entire image with a given color
 */
//%
void fill(Image_ img, int c) {
    if (c && img->hasPadding()) {
        fillRect(img, 0, 0, img->width(), img->height(), c);
        return;
    }
    img->makeWritable();
    memset(img->pix(), img->fillMask(c), img->pixLength());
}

void fillRect(Image_ img, int x, int y, int w, int h, int c) {
    if (w == 0 || h == 0 || x >= img->width() || y >= img->height())
        return;

    int x2 = x + w - 1;
    int y2 = y + h - 1;

    if (x2 < 0 || y2 < 0)
        return;

    img->clamp(&x2, &y2);
    img->clamp(&x, &y);
    w = x2 - x + 1;
    h = y2 - y + 1;

    if (!img->hasPadding() && x == 0 && y == 0 && w == img->width() && h == img->height()) {
        fill(img, c);
        return;
    }

    img->makeWritable();

    auto bh = img->byteHeight();
    uint8_t f = img->fillMask(c);

    uint8_t *p = img->pix(x, y);
    while (w-- > 0) {
        if (img->bpp() == 1) {
            auto ptr = p;
            unsigned mask = 0x01 << (y & 7);

            for (int i = 0; i < h; ++i) {
                if (mask == 0x100) {
                    if (h - i >= 8) {
                        *++ptr = f;
                        i += 7;
                        continue;
                    } else {
                        mask = 0x01;
                        ++ptr;
                    }
                }
                if (c)
                    *ptr |= mask;
                else
                    *ptr &= ~mask;
                mask <<= 1;
            }

        } else if (img->bpp() == 4) {
            auto ptr = p;
            unsigned mask = 0x0f;
            if (y & 1)
                mask <<= 4;

            for (int i = 0; i < h; ++i) {
                if (mask == 0xf00) {
                    if (h - i >= 2) {
                        *++ptr = f;
                        i++;
                        continue;
                    } else {
                        mask = 0x0f;
                        ptr++;
                    }
                }
                *ptr = (*ptr & ~mask) | (f & mask);
                mask <<= 4;
            }
        }
        p += bh;
    }
}

//%
void _fillRect(Image_ img, int xy, int wh, int c) {
    fillRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
}

/**
 * Return a copy of the current image
 */
//%
Image_ clone(Image_ img) {
    uint32_t sz = img->length();
    Image_ r = new (::operator new(sizeof(RefImage) + sz)) RefImage(sz);
    memcpy(r->data(), img->data(), img->length());
    MEMDBG("mkImageClone: %d X %d => %p", img->width(), img->height(), r);
    return r;
}

/**
 * Flips (mirrors) pixels horizontally in the current image
 */
//%
void flipX(Image_ img) {
    img->makeWritable();

    int bh = img->byteHeight();
    auto a = img->pix();
    auto b = img->pix(img->width() - 1, 0);

    uint8_t tmp[bh];

    while (a < b) {
        memcpy(tmp, a, bh);
        memcpy(a, b, bh);
        memcpy(b, tmp, bh);
        a += bh;
        b -= bh;
    }
}

/**
 * Flips (mirrors) pixels vertically in the current image
 */
//%
void flipY(Image_ img) {
    img->makeWritable();

    // this is quite slow - for small 16x16 sprite it will take in the order of 1ms
    // something faster requires quite a bit of bit tweaking, especially for mono images
    for (int i = 0; i < img->width(); ++i) {
        int a = 0;
        int b = img->height() - 1;
        while (a < b) {
            int tmp = getPixel(img, i, a);
            setPixel(img, i, a, getPixel(img, i, b));
            setPixel(img, i, b, tmp);
            a++;
            b--;
        }
    }
}

/**
 * Every pixel in image is moved by (dx,dy)
 */
//%
void scroll(Image_ img, int dx, int dy) {
    img->makeWritable();
    auto bh = img->byteHeight();
    auto w = img->width();
    if (dx < 0) {
        dx = -dx;
        if (dx < w)
            memmove(img->pix(), img->pix(dx, 0), (w - dx) * bh);
        else
            dx = w;
        memset(img->pix(w - dx, 0), 0, dx * bh);
    } else if (dx > 0) {
        if (dx < w)
            memmove(img->pix(dx, 0), img->pix(), (w - dx) * bh);
        else
            dx = w;
        memset(img->pix(), 0, dx * bh);
    }
    // TODO implement dy
}

const uint8_t bitdouble[] = {0x00, 0x03, 0x0c, 0x0f, 0x30, 0x33, 0x3c, 0x3f,
                             0xc0, 0xc3, 0xcc, 0xcf, 0xf0, 0xf3, 0xfc, 0xff};
const uint8_t nibdouble[] = {0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
                             0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff};

/**
 * Stretches the image horizontally by 100%
 */
//%
Image_ doubledX(Image_ img) {
    if (img->width() > 126)
        return NULL;

    Image_ r = mkImage(img->width() * 2, img->height(), img->bpp());
    auto src = img->pix();
    auto dst = r->pix();
    auto w = img->width();
    auto bh = img->byteHeight();

    for (int i = 0; i < w; ++i) {
        memcpy(dst, src, bh);
        dst += bh;
        memcpy(dst, src, bh);
        dst += bh;

        src += bh;
    }

    return r;
}

/**
 * Stretches the image vertically by 100%
 */
//%
Image_ doubledY(Image_ img) {
    if (img->height() > 126)
        return NULL;

    Image_ r = mkImage(img->width(), img->height() * 2, img->bpp());
    auto src = img->pix();
    auto dst = r->pix();

    auto w = img->width();
    auto bh = r->byteHeight();
    auto dbl = img->bpp() == 1 ? bitdouble : nibdouble;

    for (int i = 0; i < w; ++i) {
        for (int j = 0; j < bh; j += 2) {
            *dst++ = dbl[*src & 0xf];
            if (j != bh - 1)
                *dst++ = dbl[*src >> 4];
            src++;
        }
    }

    return r;
}

/**
 * Replaces one color in an image with another
 */
//%
void replace(Image_ img, int from, int to) {
    if (img->bpp() != 4)
        return;
    to &= 0xf;
    if (from == to)
        return;

    // avoid bleeding 'to' color into the overflow areas of the picture
    if (from == 0 && img->hasPadding()) {
        for (int i = 0; i < img->height(); ++i)
            for (int j = 0; j < img->width(); ++j)
                if (getPixel(img, j, i) == from)
                    setPixel(img, j, i, to);
        return;
    }

    auto ptr = img->pix();
    auto len = img->pixLength();
    while (len--) {
        auto b = *ptr;
        if ((b & 0xf) == from)
            b = (b & 0xf0) | to;
        if ((b >> 4) == from)
            b = (to << 4) | (b & 0xf);
        *ptr++ = b;
    }
}

/**
 * Stretches the image in both directions by 100%
 */
//%
Image_ doubled(Image_ img) {
    Image_ tmp = doubledX(img);
    Image_ r = doubledY(tmp);
    decrRC(tmp);
    return r;
}

bool drawImageCore(Image_ img, Image_ from, int x, int y, int color) {
    auto w = from->width();
    auto h = from->height();
    auto sh = img->height();
    auto sw = img->width();

    if (x + w <= 0)
        return false;
    if (x >= sw)
        return false;
    if (y + h <= 0)
        return false;
    if (y >= sh)
        return false;

    auto len = y < 0 ? min(sh, h + y) : min(sh - y, h);
    auto tbp = img->bpp();
    auto fbp = from->bpp();
    auto y0 = y;

    //DMESG("drawIMG(%d,%d) at (%d,%d) w=%d bh=%d len=%d", 
    //    w,h,x, y, img->width(), img->byteHeight(), len );

    for (int xx = 0; xx < w; ++xx, ++x) {
        if (0 <= x && x < sw) {
            if (tbp == 1 && fbp == 1) {
                y = y0;

                auto data = from->pix(xx, 0);
                int shift = (y & 7);
                auto off = img->pix(x, y);
                auto off0 = img->pix(x, 0);
                auto off1 = img->pix(x, img->height() - 1);

                int y1 = y + h + (y & 7);
                int prev = 0;

                while (y < y1 - 8) {
                    int curr = *data++ << shift;
                    if (off0 <= off && off <= off1) {
                        uint8_t v = (curr >> 0) | (prev >> 8);

                        if (color == -1) {
                            if (*off & v)
                                return true;
                        } else {
                            *off |= v;
                        }
                    }
                    off++;
                    prev = curr;
                    y += 8;
                }

                int left = y1 - y; 
                if (left > 0) {
                    int curr = *data << shift;
                    if (off0 <= off && off <= off1) {
                        uint8_t v = ((curr >> 0) | (prev >> 8)) & (0xff >> (8 - left));
                        if (color == -1) {
                            if (*off & v)
                                return true;
                        } else {
                            *off |= v;
                        }
                    }
                }

            } else if (tbp == 4 && fbp == 4) {
                y = y0;

                auto fdata = (uint32_t*)from->pix(xx, 0);
                auto tdata = img->pix(x, y);

                //DMESG("%d,%d xx=%d/%d - %p (%p) -- %d",x,y,xx,w,tdata,img->pix(),
                //    (uint8_t*)fdata - from->pix());

                auto cnt = from->wordHeight();

                #define COL(s) ((v >> (s)) & 0xf)
                
                #define STEPA(s)  \
                    if (COL(s) && 0 <= y && y < sh) SETLOW(s); \
                    y++; 
                #define STEPB(s)  \
                    if (COL(s) && 0 <= y && y < sh) SETHIGH(s); \
                    y++; tdata++;
                 #define STEPAQ(s)  \
                    if (COL(s)) SETLOW(s); 
                #define STEPBQ(s)  \
                    if (COL(s)) SETHIGH(s); \
                    tdata++;

                // TODO measure perf
                // #define ORDER(A,B) A(4); B(0); A(12); B(8); A(20); B(16); A(28); B(24)
                #define ORDER(A,B) for (int k = 0; k < 32; k += 8) { A(k); B(4+k); }
                #define LOOP(A,B) while (cnt--) { \
                            auto v = *fdata++; \
                            if (0 <= y && y < sh - 8) { \
                                ORDER(A ## Q,  B ## Q); \
                                y += 8; \
                            } else { \
                                ORDER(A, B); \
                            } \
                        }

                if (color != -1) {
                #define SETHIGH(s) *tdata = (*tdata & 0x0f) | ((COL(s)) << 4)
                #define SETLOW(s) *tdata = (*tdata & 0xf0) | COL(s)
                    if (y & 1)
                        LOOP(STEPB, STEPA)
                    else
                        LOOP(STEPA, STEPB)
                } else {
                    #undef SETHIGH
                    #define SETHIGH(s) if(*tdata & 0xf0) return true
                    #undef SETLOW
                    #define SETLOW(s) if(*tdata & 0x0f) return true
                     if (y & 1)
                        LOOP(STEPB, STEPA)
                    else
                        LOOP(STEPA, STEPB)
                }
            } else if (tbp == 4 && fbp == 1) {
                // icon mode
                auto fdata = from->pix(xx, y < 0 ? -y : 0);
                auto tdata = img->pix(x, y > 0 ? y : 0);

                unsigned mask = 0x01;
                auto v = *fdata++;
                int off = (y & 1) ? 1 : 0;
                if (y < 0) {
                    mask <<= -y & 7;
                    off = 0;
                }
                for (int i = off; i < len+off; ++i) {
                    if (mask == 0x100) {
                        mask = 0x01;
                        v = *fdata++;
                    }
                    if (v & mask) {
                        if (i & 1)
                            *tdata = (*tdata & 0x0f) | (color << 4);
                        else
                            *tdata = (*tdata & 0xf0) | color;
                    }
                    mask <<= 1;
                    if (i & 1)
                        tdata++;
                }
            }
        }
    }

    return false;
}

/**
 * Draw given image on the current image
 */
//%
void drawImage(Image_ img, Image_ from, int x, int y) {
    // TODO optimize
    img->makeWritable();
    fillRect(img, x, y, from->width(), from->height(), 0);
    drawImageCore(img, from, x, y, 0);
}

/**
 * Draw given image with transparent background on the current image
 */
//%
void drawTransparentImage(Image_ img, Image_ from, int x, int y) {
    img->makeWritable();
    drawImageCore(img, from, x, y, 0);
}

/**
 * Check if the current image "collides" with another
 */
//%
bool overlapsWith(Image_ img, Image_ other, int x, int y) {
    return drawImageCore(img, other, x, y, -1);
}

// Image_ format:
//  byte 0: magic 0xe4 - 4 bit color; 0xe1 is monochromatic
//  byte 1: width in pixels
//  byte 2: height in pixels
//  byte 3: padding (should be zero)
//  byte 4...N: data 4 bits per pixels, high order nibble printed first, lines aligned to 32 bit
//  words byte 4...N: data 1 bit per pixels, high order bit printed first, lines aligned to byte

//%
void _drawIcon(Image_ img, Buffer icon, int xy, int c) {
    if (!isValidImage(icon) || icon->data[0] != 0xe1)
        return;

    img->makeWritable();
    auto ii = new RefImage(icon);
    drawImageCore(img, ii, XX(xy), YY(xy), c);
    decrRC(ii);
}

static void drawLineLow(Image_ img, int x0, int y0, int x1, int y1, int c) {
    int dx = x1 - x0;
    int dy = y1 - y0;
    int yi = 1;
    if (dy < 0) {
        yi = -1;
        dy = -dy;
    }
    int D = 2 * dy - dx;
    dx <<= 1;
    dy <<= 1;
    int y = y0;
    for (int x = x0; x <= x1; ++x) {
        setCore(img, x, y, c);
        if (D > 0) {
            y += yi;
            D -= dx;
        }
        D += dy;
    }
}

static void drawLineHigh(Image_ img, int x0, int y0, int x1, int y1, int c) {
    int dx = x1 - x0;
    int dy = y1 - y0;
    int xi = 1;
    if (dx < 0) {
        xi = -1;
        dx = -dx;
    }
    int D = 2 * dx - dy;
    dx <<= 1;
    dy <<= 1;
    int x = x0;
    for (int y = y0; y <= y1; ++y) {
        setCore(img, x, y, c);
        if (D > 0) {
            x += xi;
            D -= dy;
        }
        D += dx;
    }
}

void drawLine(Image_ img, int x0, int y0, int x1, int y1, int c) {
    if (x1 < x0) {
        drawLine(img, x1, y1, x0, y0, c);
        return;
    }

    int w = x1 - x0;
    int h = y1 - y0;

    if (h == 0) {
        if (w == 0)
            setPixel(img, x0, y0, c);
        else
            fillRect(img, x0, y0, w + 1, 1, c);
        return;
    }

    if (w == 0) {
        if (h > 0)
            fillRect(img, x0, y0, 1, h + 1, c);
        else
            fillRect(img, x0, y1, 1, -h + 1, c);
        return;
    }

    if (x1 < 0 || x0 >= img->width())
        return;
    if (x0 < 0) {
        y0 -= (h * x0 / w);
        x0 = 0;
    }
    if (x1 >= img->width()) {
        int d = (img->width() - 1) - x1;
        y1 += (h * d / w);
        x1 = img->width() - 1;
    }

    if (y0 < y1) {
        if (y0 >= img->height() || y1 < 0)
            return;
        if (y0 < 0) {
            x0 -= (w * y0 / h);
            y0 = 0;
        }
        if (y1 >= img->height()) {
            int d = (img->height() - 1) - y1;
            x1 += (w * d / h);
            y1 = img->height();
        }
    } else {
        if (y1 >= img->height() || y0 < 0)
            return;
        if (y1 < 0) {
            x1 -= (w * y1 / h);
            y1 = 0;
        }
        if (y0 >= img->height()) {
            int d = (img->height() - 1) - y0;
            x0 += (w * d / h);
            y0 = img->height();
        }
    }

    img->makeWritable();

    if (h < 0) {
        h = -h;
        if (h < w)
            drawLineLow(img, x0, y0, x1, y1, c);
        else
            drawLineHigh(img, x1, y1, x0, y0, c);
    } else {
        if (h < w)
            drawLineLow(img, x0, y0, x1, y1, c);
        else
            drawLineHigh(img, x0, y0, x1, y1, c);
    }
}

//%
void _drawLine(Image_ img, int xy, int wh, int c) {
    drawLine(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
}

} // namespace ImageMethods

namespace image {
/**
 * Create new empty (transparent) image
 */
//%
Image_ create(int width, int height) {
    Image_ r = mkImage(width, height, IMAGE_BITS);
    if (r)
        memset(r->pix(), 0, r->pixLength());
    return r;
}

/**
 * Create new image with given content
 */
//%
Image_ ofBuffer(Buffer buf) {
    if (!isValidImage(buf))
        return NULL;
    return new RefImage(buf);
}

/**
 * Double the size of an icon
 */
//%
Buffer doubledIcon(Buffer icon) {
    if (!isValidImage(icon))
        return NULL;

    auto r = new RefImage(icon);
    auto t = ImageMethods::doubled(r);
    auto res = mkBuffer(t->data(), t->length());
    decrRC(r);
    decrRC(t);

    return res;
}

} // namespace image

extern "C" void *memcpy(void *dst, const void *src, size_t sz) {
    if (sz >= 4 && !((uintptr_t)dst & 3) && !((uintptr_t)src & 3)) {
        size_t cnt = sz >> 2;
        uint32_t *d = (uint32_t *)dst;
        const uint32_t *s = (const uint32_t *)src;
        while (cnt--) {
            *d++ = *s++;
        }
        sz &= 3;
        dst = d;
        src = s;
    }

    uint8_t *dd = (uint8_t *)dst;
    uint8_t *ss = (uint8_t *)src;

    while (sz--) {
        *dd++ = *ss++;
    }

    return dst;
}

extern "C" void *memset(void *dst, int v, size_t sz) {
    if (sz >= 4 && !((uintptr_t)dst & 3)) {
        size_t cnt = sz >> 2;
        uint32_t vv = 0x01010101 * v;
        uint32_t *d = (uint32_t *)dst;
        while (cnt--) {
            *d++ = vv;
        }
        sz &= 3;
        dst = d;
    }

    uint8_t *dd = (uint8_t *)dst;

    while (sz--) {
        *dd++ = v;
    }

    return dst;
}
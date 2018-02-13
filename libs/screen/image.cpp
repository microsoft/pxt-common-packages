#include "pxt.h"

#if IMAGE_BITS == 1
#define IMAGE_TAG 0xf1
#elif IMAGE_BITS == 4
#define IMAGE_TAG 0xf4
#else
#error "Invalid IMAGE_BITS"
#endif

#define XX(v) ((uint32_t)(v)&0xffff)
#define YY(v) ((uint32_t)(v) >> 16)

namespace pxt {

PXT_VTABLE_BEGIN(RefImage, 0, 0)
PXT_VTABLE_END

void RefImage::destroy() {
    decrRC(buffer());
}

void RefImage::print() {
    DMESG("RefImage %p r=%d size=%d x %d", this, refcnt, width(), height());
}

int RefImage::width() {
    return data()[1];
}

int RefImage::byteWidth() {
    return (data()[1] * bpp() + 7) >> 3;
}

int RefImage::bpp() {
    return data()[0] & 0xf;
}

int RefImage::height() {
    return data()[2];
}

void RefImage::makeWritable() {
    if (hasBuffer() && buffer()->isReadOnly()) {
        auto b = mkBuffer(data(), length());
        decrRC(buffer());
        _buffer = b;
    }
}

uint8_t *RefImage::pix(int x, int y) {
    uint8_t *d = data()[3 + byteWidth() * y];
    if (x)
        if (bpp() == 1)
            d += x >> 3;
        else if (bpp() == 4)
            d += x >> 1;
    return d;
}

uint8_t RefImage::fillMask(color c) {
    return img->bpp() == 1 ? (c & 1) * 0xff : 0x11 * (c & 0xf);
}

bool RefImage::inRange(int x, int y) {
    return 0 <= x && x < width() && 0 <= y && y < height();
}

bool RefImage::clamp(int *x, int *y) {
    *x = min(max(*x, 0), width() - 1);
    *y = min(max(*y, 0), height() - 1);
}

RefImage::RefImage(BoxedBuffer *buf) : PXT_VTABLE_INIT(RefImage), _buffer(buf) {}
RefImage::RefImage(uint32_t sz)
    : PXT_VTABLE_INIT(RefImage), _buffer((BoxedBuffer *)((sz << 1) | 1)) {}

Image mkImage(int width, int height, int bpp) {
    if (width < 0 || height < 0 || width > 255 || height > 2000)
        return NULL;
    if (bpp != 1 && bpp != 4)
        return NULL;
    uint32_t sz = 3 + ((width * bpp + 7) / 8) * height;
    Image r = new (::operator new(sizeof(RefImage) + sz)) RefImage(sz);
    r->data[0] = 0xf0 | bpp;
    r->data[1] = width;
    r->data[2] = height;
    MEMDBG("mkImage: %d X %d => %p", width, height, r);
    return r;
}

} // namespace pxt

namespace image {
/**
 * Create new empty (transparent) image
 */
//%
Image create(int width, int height) {
    Image r = mkImage(width, height, IMAGE_BITS);
    if (r)
        memset(r->data() + 3, 0, r->length() - 3);
    return r;
}

/**
 * Create new image with given content
 */
//%
Image ofBuffer(Buffer buf) {
    if (!buf || buf->length < 4)
        return NULL;
    if (buf[0] != 0xf1 && buf[0] != IMAGE_TAG)
        return NULL;
    return new RefImage(buf);
}

} // namespace image

namespace ImageMethods {

/**
 * Get the width of the image
 */
//%
int width(Image img) {
    return img->width();
}

/**
 * Get the height of the image
 */
//%
int height(Image img) {
    return img->height();
}

/**
 * Set pixel color
 */
//%
void set(Image img, int x, int y, color c) {
    if (!img->inRange(x, y))
        return;
    auto ptr = img->pix(x, y);
    if (img->bpp() == 1) {
        uint8_t mask = 1 << 7 - (x & 7);
        if (c)
            *ptr |= mask;
        else
            *ptr &= ~mask;
    } else if (img->bpp() == 4) {
        if (x & 1)
            *ptr = (*ptr & 0xf0) | (c & 0xf);
        else
            *ptr = (*ptr & 0x0f) | (c << 4);
    }
}

/**
 * Get a pixel color
 */
//%
int get(Image img, int x, int y) {
    if (!img->inRange(x, y))
        return 0;
    auto ptr = img->pix(x, y);
    if (img->bpp() == 1) {
        uint8_t mask = 1 << (x & 7);
        return (*ptr & mask) ? 1 : 0;
    } else if (img->bpp() == 4) {
        if (x & 1)
            return *ptr & 0x0f;
        else
            return *ptr >> 4;
    }
}

/**
 * Fill entire image with a given color
 */
//%
void fill(Image img, color c) {
    memset(data() + 3, img->fillMask(c), length() - 3);
}

/**
 * Fill a rectangle
 */
//%
void _fillRect(Image img, int xy, int wh, color c) {
    int x = XX(xy);
    int y = YY(xy);
    int w = XX(wh);
    int h = YY(wh);

    int x2 = x + w - 1;
    int y2 = y + h - 1;
    img->clamp(&x2, &y2);
    img->clamp(&x, &y);
    w = x2 - x + 1;
    h = y2 - y + 1;

    int d = img->width() - w;
    auto bw = img->byteWidth();
    uint8_t f = img->fillMask(c);

    uint8_t *p = img->pix(x, y);
    while (h-- > 0) {
        if (img->bpp() == 1) {
            auto ptr = p;
            uint8_t mask = 1 << 7 - (x & 7);

            for (int i = 0; i < w; ++i) {
                if (mask == 0) {
                    if (w - i >= 8) {
                        *ptr++ = f;
                        i += 7;
                        continue;
                    } else {
                        mask = 0x80;
                        ptr++;
                    }
                }
                if (c)
                    *ptr |= mask;
                else
                    *ptr &= ~mask;
                mask >>= 1;
            }

        } else if (img->bpp() == 4) {
            auto ptr = p;
            uint8_t mask = 0xf0;
            if (x & 1)
                mask >>= 4;

            for (int i = 0; i < w; ++i) {
                if (mask == 0) {
                    if (w - i >= 2) {
                        *ptr++ = f;
                        i++;
                        continue;
                    } else {
                        mask = 0xf0;
                        ptr++;
                    }
                }
                *ptr = (*ptr & ~mask) | (f & mask);
                mask >>= 4;
            }
        }
        p += bw;
    }
}

/**
 * Return a copy of the current image
 */
//%
Image clone(Image img) {
    uint32_t sz = img->length();
    Image r = new (::operator new(sizeof(RefImage) + sz)) RefImage(sz);
    memcpy(r->data(), img->data(), img->length());
    MEMDBG("mkImageClone: %d X %d => %p", img->width(), img->height(), r);
    return r;
}

/**
 * Flips (mirrors) pixels horizontally in the current image
 */
//%
void flipX(Image img) {
    // TODO
}

/**
 * Flips (mirrors) pixels vertically in the current image
 */
//%
void flipY(Image img) {
    // TODO
}

/**
 * Every pixel in image is moved by (dx,dy)
 */
//%
void scroll(Image img, int dx, int dy) {
    auto bw = img->byteWidth();
    auto d = img->data();
    auto h = img->height();
    if (dy < 0) {
        dy = -dy;
        if (dy < h)
            memmove(img->pix(), img->pix(0, dy), (h - dy) * bw) else dy = h;
        memset(img->pix(0, h - dy), 0, dy * bw)
    } else if (dy > 0) {
        if (dy < h)
            memmove(img->pix(0, dy), img->pix(), (h - dy) * bw);
        else
            dy = h;
        memset(img->pix(0, 0), 0, dy * bw)
    }
    // TODO implement dx
}

const uint8_t bitdouble[] = {0x00, 0x03, 0x0c, 0x0f, 0x30, 0x33, 0x3c, 0x3f,
                             0xc0, 0xc3, 0xcc, 0xcf, 0xf0, 0xf3, 0xfc, 0xff};
const uint8_t nibdouble[] = {0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
                             0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff};

/**
 * Stretches the image horizontally by 100%
 */
//%
Image doubleX(Image img) {
    Image r = create(img->width() * 2, img->height());
    auto src = img->pix();
    auto dst = r->pix();
    auto h = img->height();
    auto w = img->width();
    auto dbl = bpp() == 1 ? bitdouble : nibdouble;

    for (int i = 0; i < h; ++i) {
        for (int j = 0; j < w; j += 2) {
            if (img->bpp() == 1)
                *dst++ = dbl[*src >> 4];
            if (j != w - 1)
                *dst++ = dbl[*src & 0xf];
            src++;
        }
    }

    return r;
}

/**
 * Stretches the image vertically by 100%
 */
//%
Image doubleY(Image img) {
    Image r = create(img->width(), img->height() * 2);
    auto src = img->pix();
    auto dst = r->pix();
    auto bw = img->byteWidth();

    for (int i = 0; i < h; ++i) {
        memcpy(dst, src, bw);
        dst += bw;
        memcpy(dst + bw, src, bw);
        dst += bw;
        src += bw;
    }

    return r;
}

/**
 * Stretches the image in both directions by 100%
 */
//%
Image double_(Image) {
    Image tmp = img->doubleX();
    Image r = tmp->doubleY();
    decrRC(tmp);
    return r;
}

bool drawImageCore(Image img, Image from, int x, int y, int color) {
    auto w = from->width();
    auto h = from->height();
    auto sh = img->height();
    auto sw = img->width();

    if (x + w <= 0)
        return;
    if (x >= sw)
        return;
    if (y + h <= 0)
        return;
    if (y >= sh)
        return;

    auto len = x < 0 ? min(sw, w + x) : min(sw - x, w);
    auto tbp = img->bpp();
    auto fbp = from->bpp();

    for (int i = 0; i < h; ++i, ++y) {
        if (0 <= y && y < sh) {
            if (tbp == 1 && fbp == 1) {
                auto data = from->pix(0, i);
                int shift = 8 + (7 - (x & 7));
                auto off = img->pix(x, y);
                auto off0 = img->pix(0, y);
                auto off1 = img->pix(img->width() - 1, y);

                int x1 = x + w + shift;
                int prev = 0;

                while (x < x1 - 8) {
                    int curr = *data++ << shift;
                    if (off0 <= off && off <= off1) {
                        uint8_t v = (curr >> 8) | prev;

                        if (color == -1) {
                            if (*off & v)
                                return true;
                        } else {
                            *off |= v;
                        }
                    }
                    off++;
                    prev = curr;
                    x += 8;
                }

                int left = x1 - x;
                if (left > 0) {
                    int curr = *data << shift;
                    if (off0 <= off && off <= off1) {
                        uint8_t v = ((curr >> 8) | prev) & (0xff << (8 - left)) if (color == -1) {
                            if (*off & v)
                                return true;
                        }
                        else {
                            *off |= v;
                        }
                    }
                }

            } else if (tbp == 4 && fbp == 4) {
                auto fdata = from->pix(x < 0 ? -x : 0, i);
                auto tdata = img->pix(x > 0 ? x : 0, y);

                auto shift = (x & 1) ? 0 : 4;
                for (int i = 0; i < len; ++i) {
                    auto v = (*fdata >> shift) & 0xf;
                    if (v) {
                        if (color == -1) {
                            if ((i & 1) && (*tdata & 0x0f))
                                return true;
                            if (!(i & 1) && (*tdata & 0xf0))
                                return true;
                        } else {
                            if (i & 1)
                                *tdata = (*tdata & 0xf0) | v;
                            else
                                *tdata = (*tdata & 0x0f) | (v << 4);
                        }
                    }
                    if (shift == 0) {
                        fdata++;
                        shift = 4;
                    } else {
                        shift = 0;
                    }
                    if (i & 1)
                        tdata++;
                }
            } else if (tbp == 4 && fbp == 1) {
                // icon mode
                auto fdata = from->pix(x < 0 ? -x : 0, i);
                auto tdata = img->pix(x > 0 ? x : 0, y);

                auto mask = 0x80 >> (x & 7);
                auto v = *fdata++;
                for (int i = 0; i < len; ++i) {
                    if (v & mask) {
                        if (i & 1)
                            *tdata = (*tdata & 0xf0) | color;
                        else
                            *tdata = (*tdata & 0x0f) | (color << 4);
                    }
                    mask >>= 1;
                    if (mask == 0) {
                        mask = 0x80;
                        v = *fdata++;
                    }
                    if (i & 1)
                        tdata++;
                }
            }
        }
    }
}

/**
 * Draw given image on the current image
 */
//%
void drawImage(Image img, Image from, int x, int y) {
    drawImageCore(img, from, x, y, 0);
}

/**
 * Check if the current image "collides" with another
 */
//%
bool overlapsWith(Image img, Image other, int x, int y) {
    return drawImageCore(img, other, x, y, -1);
}

// Image format:
//  byte 0: magic 0xf4 - 4 bit color; 0xf0 is monochromatic
//  byte 1: width in pixels
//  byte 2: height in pixels
//  byte 3...N: data 4 bits per pixels, high order nibble printed first, lines aligned to byte
//  byte 3...N: data 1 bit per pixels, low order bit printed first, lines aligned to byte

/**
 * Draw an icon (monochromatic image) using given color
 */
//%
_drawIcon(Image img, Image icon, int xy, color c) {
    drawImageCore(img, icon, XX(xy), YY(xy), c)
}

} // namespace ImageMethods
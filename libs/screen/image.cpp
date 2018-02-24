#include "pxt.h"

#if IMAGE_BITS == 1
#define IMAGE_TAG 0xf1
#elif IMAGE_BITS == 4
#define IMAGE_TAG 0xf4
#else
#error "Invalid IMAGE_BITS"
#endif

#define XX(v) (int)(((int16_t)(v)))
#define YY(v) (int)(((int16_t)(((int32_t)(v)) >> 16)))

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
    if (hasBuffer()) {
        if (buffer()->isReadOnly()) {
            auto b = mkBuffer(data(), length());
            decrRC(buffer());
            _buffer = (unsigned)b;
        }
    } else {
        _buffer |= 2;
    }
}

uint8_t *RefImage::pix(int x, int y) {
    uint8_t *d = &data()[3 + byteWidth() * y];
    if (x) {
        if (bpp() == 1)
            d += x >> 3;
        else if (bpp() == 4)
            d += x >> 1;
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

RefImage::RefImage(BoxedBuffer *buf) : PXT_VTABLE_INIT(RefImage), _buffer((unsigned)buf) {
    incrRC(buf);
}
RefImage::RefImage(uint32_t sz) : PXT_VTABLE_INIT(RefImage), _buffer((sz << 2) | 3) {}

Image mkImage(int width, int height, int bpp) {
    if (width < 0 || height < 0 || width > 255 || height > 2000)
        return NULL;
    if (bpp != 1 && bpp != 4)
        return NULL;
    uint32_t sz = 3 + ((width * bpp + 7) / 8) * height;
    Image r = new (::operator new(sizeof(RefImage) + sz)) RefImage(sz);
    auto d = r->data();
    d[0] = 0xf0 | bpp;
    d[1] = width;
    d[2] = height;
    MEMDBG("mkImage: %d X %d => %p", width, height, r);
    return r;
}

bool isValidImage(Buffer buf) {
    if (!buf || buf->length < 4)
        return false;
    
    if (buf->data[0] != 0xf1 && buf->data[0] != 0xf4)
        return false;
    
    int bpp = buf->data[0] & 0xf;
    int sz = buf->data[2] * ((buf->data[1] * bpp + 7) >> 3);
    if (3 + sz != buf->length)
        return false;
    
    return true;
}

} // namespace pxt

namespace ImageMethods {

/**
 * Get the width of the image
 */
//% property
int width(Image img) {
    return img->width();
}

/**
 * Get the height of the image
 */
//% property
int height(Image img) {
    return img->height();
}

static inline void setCore(Image img, int x, int y, int c) {
    auto ptr = img->pix(x, y);
    if (img->bpp() == 1) {
        uint8_t mask = 0x80 >> (x & 7);
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
 * Set pixel color
 */
//%
void set(Image img, int x, int y, int c) {
    if (!img->inRange(x, y))
        return;
    img->makeWritable();
    setCore(img, x, y, c);
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
        uint8_t mask = 0x80 >> (x & 7);
        return (*ptr & mask) ? 1 : 0;
    } else if (img->bpp() == 4) {
        if (x & 1)
            return *ptr & 0x0f;
        else
            return *ptr >> 4;
    }
    return 0;
}

/**
 * Fill entire image with a given color
 */
//%
void fill(Image img, int c) {
    img->makeWritable();
    memset(img->pix(), img->fillMask(c), img->length() - 3);
}

void fillRect(Image img, int x, int y, int w, int h, int c) {
    int x2 = x + w - 1;
    int y2 = y + h - 1;
    img->clamp(&x2, &y2);
    img->clamp(&x, &y);
    w = x2 - x + 1;
    h = y2 - y + 1;

    img->makeWritable();

    auto bw = img->byteWidth();
    uint8_t f = img->fillMask(c);

    uint8_t *p = img->pix(x, y);
    while (h-- > 0) {
        if (img->bpp() == 1) {
            auto ptr = p;
            uint8_t mask = 0x80 >> (x & 7);

            for (int i = 0; i < w; ++i) {
                if (mask == 0) {
                    if (w - i >= 8) {
                        *++ptr = f;
                        i += 7;
                        continue;
                    } else {
                        mask = 0x80;
                        ++ptr;
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

//%
void _fillRect(Image img, int xy, int wh, int c) {
    fillRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
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
    img->makeWritable();

    // this is quite slow - for small 16x16 sprite it will take in the order of 1ms    
    // something faster requires quite a bit of bit tweaking, especially for mono images
    for (int i = 0; i < img->height(); ++i) {
        int a = 0;
        int b = img->width() - 1;
        while (a < b) {
            int tmp = get(img, a, i);
            set(img, a, i, get(img, b, i));
            set(img, b, i, tmp);
            a++;
            b--;
        }
    }
}

/**
 * Flips (mirrors) pixels vertically in the current image
 */
//%
void flipY(Image img) {
    img->makeWritable();

    int bw = img->byteWidth();
    auto a = img->pix();
    auto b = img->pix(0, img->height() - 1);

    uint8_t tmp[bw];

    while (a < b) {
        memcpy(tmp, a, bw);
        memcpy(a, b, bw);
        memcpy(b, tmp, bw);
        a += bw;
        b -= bw; 
    }
}

/**
 * Every pixel in image is moved by (dx,dy)
 */
//%
void scroll(Image img, int dx, int dy) {
    img->makeWritable();
    auto bw = img->byteWidth();
    auto h = img->height();
    if (dy < 0) {
        dy = -dy;
        if (dy < h)
            memmove(img->pix(), img->pix(0, dy), (h - dy) * bw);
        else
            dy = h;
        memset(img->pix(0, h - dy), 0, dy * bw);
    } else if (dy > 0) {
        if (dy < h)
            memmove(img->pix(0, dy), img->pix(), (h - dy) * bw);
        else
            dy = h;
        memset(img->pix(), 0, dy * bw);
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
Image doubledX(Image img) {
    if (img->width() > 126)
        return NULL;

    Image r = mkImage(img->width() * 2, img->height(), img->bpp());
    auto src = img->pix();
    auto dst = r->pix();
    auto h = img->height();
    auto bw = r->byteWidth();
    auto dbl = img->bpp() == 1 ? bitdouble : nibdouble;

    for (int i = 0; i < h; ++i) {
        for (int j = 0; j < bw; j += 2) {
            *dst++ = dbl[*src >> 4];
            if (j != bw - 1)
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
Image doubledY(Image img) {
    if (img->height() > 126)
        return NULL;

    Image r = mkImage(img->width(), img->height() * 2, img->bpp());
    auto src = img->pix();
    auto dst = r->pix();
    auto bw = img->byteWidth();
    auto h = img->height();

    for (int i = 0; i < h; ++i) {
        memcpy(dst, src, bw);
        dst += bw;
        memcpy(dst, src, bw);
        dst += bw;

        src += bw;
    }

    return r;
}

/**
 * Stretches the image in both directions by 100%
 */
//%
Image doubled(Image img) {
    Image tmp = doubledX(img);
    Image r = doubledY(tmp);
    decrRC(tmp);
    return r;
}

bool drawImageCore(Image img, Image from, int x, int y, int color) {
    auto w = from->width();
    auto h = from->height();
    auto sh = img->height();
    auto sw = img->width();

    //DMESG("drawIMG at (%d,%d) w=%d bw=%d", x, y, img->width(), img->byteWidth() );

    if (x + w <= 0)
        return false;
    if (x >= sw)
        return false;
    if (y + h <= 0)
        return false;
    if (y >= sh)
        return false;

    auto len = x < 0 ? min(sw, w + x) : min(sw - x, w);
    auto tbp = img->bpp();
    auto fbp = from->bpp();
    auto x0 = x;

    for (int i = 0; i < h; ++i, ++y) {
        if (0 <= y && y < sh) {
            if (tbp == 1 && fbp == 1) {
                x = x0;

                auto data = from->pix(0, i);
                int shift = 8 - (x & 7);
                auto off = img->pix(x, y);
                auto off0 = img->pix(0, y);
                auto off1 = img->pix(img->width() - 1, y);

                int x1 = x + w + (x & 7);
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
                        uint8_t v = ((curr >> 8) | prev) & (0xff << (8 - left));
                         if (color == -1) {
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

    return false;
}

/**
 * Draw given image on the current image
 */
//%
void drawImage(Image img, Image from, int x, int y) {
    img->makeWritable();
    fillRect(img, x, y, from->width(), from->height(), 0);
    drawImageCore(img, from, x, y, 0);
}

/**
 * Draw given image with transparent background on the current image
 */
//%
void drawTransparentImage(Image img, Image from, int x, int y) {
    img->makeWritable();
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
//  byte 0: magic 0xf4 - 4 bit color; 0xf1 is monochromatic
//  byte 1: width in pixels
//  byte 2: height in pixels
//  byte 3...N: data 4 bits per pixels, high order nibble printed first, lines aligned to byte
//  byte 3...N: data 1 bit per pixels, high order bit printed first, lines aligned to byte

//%
void _drawIcon(Image img, Buffer icon, int xy, int c) {
    if (!isValidImage(icon) || icon->data[0] != 0xf1)
        return;

    img->makeWritable();
    auto ii = new RefImage(icon);
    drawImageCore(img, ii, XX(xy), YY(xy), c);
    decrRC(ii);
}

    static void drawLineLow(Image img, int x0, int y0, int x1, int y1, int c) {
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

    static void drawLineHigh(Image img, int x0, int y0, int x1, int y1, int c) {
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

    void drawLine(Image img, int x0, int y0, int x1, int y1, int c) {
        if (x1 < x0) {
            drawLine(img, x1, y1, x0, y0, c);
            return;
        }

        int w = x1 - x0;
        int h = y1 - y0;

        if (h == 0) {
            if (w == 0)
                set(img, x0, y0, c);
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
            y0 -= (h * x0 / w) ;
            x0 = 0;
        }
        if (x1 >= img->width()) {
            int d = (img->width() - 1) - x1;
            y1 += (h * d / w) ;
            x1 = img->width() - 1;
        }

        if (y0 < y1) {
            if (y0 >= img->height() || y1 < 0)
                return;
            if (y0 < 0) {
                x0 -= (w * y0 / h) ;
                y0 = 0;
            }
            if (y1 >= img->height()) {
                int d = (img->height() - 1) - y1;
                x1 += (w * d / h) ;
                y1 = img->height();
            }
        } else {
            if (y1 >= img->height() || y0 < 0)
                return;
            if (y1 < 0) {
                x1 -= (w * y1 / h) ;
                y1 = 0;
            }
            if (y0 >= img->height()) {
                int d = (img->height() - 1) - y0;
                x0 += (w * d / h) ;
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
    void _drawLine(Image img, int xy, int wh, int c) {
        drawLine(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
    }


} // namespace ImageMethods

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


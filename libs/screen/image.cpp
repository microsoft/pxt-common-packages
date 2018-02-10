#include "pxt.h"

#define ROW_SZ(width) ((width * IMAGE_BITS + 7) / 8)

#if IMAGE_BITS == 1
#define IMAGE_TAG 0xf1
#elif IMAGE_BITS == 4
#define IMAGE_TAG 0xf4
#else
#error "Invalid IMAGE_BITS"
#endif

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
    return length() / byteWidth();
}

void RefImage::makeWritable() {
    if (hasBuffer() && buffer()->isReadOnly()) {
        auto b = mkBuffer(data(), length());
        decrRC(buffer());
        _buffer = b;
    }
}

RefImage::RefImage(BoxedBuffer *buf) : PXT_VTABLE_INIT(RefImage), _buffer(buf) {}
RefImage::RefImage(uint32_t sz)
    : PXT_VTABLE_INIT(RefImage), _buffer((BoxedBuffer *)((sz << 1) | 1)) {}

} // namespace pxt

namespace image {
/**
 * Create new empty (transparent) image
 */
//%
Image create(int width, int height) {
    if (width < 0 || height < 0 || width > 255 || height > 2000)
        return NULL;
    uint32_t sz = 2 + ROW_SZ(width) * height;
    Image r = new (::operator new(sizeof(RefImage) + sz)) RefImage(sz);
    r->length = sz;
    r->data[0] = IMAGE_TAG;
    r->data[1] = width;
    memset(r->data + 2, 0, sz - 2);
    MEMDBG("mkImage: %d X %d => %p", width, height, r);
    return r;
}

/**
 * Create new image with given content
 */
//%
Image ofBuffer(Buffer buf) {
    if (!buf || buf->length < 3)
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
        int width(Image img) { return img->width(); }

        /**
         * Get the height of the image
         */
        //%
        int height(Image img) { return img->height(); }

        /**
         * Set pixel color
         */
        //%
        void set(Image img, int x, int y, color c) {
            if (img->inRange(x, y))
                img->data[img->pix(x, y)] = img->color(c)
        }

        /**
         * Get a pixel color
         */
        //%
        get(x: int, y: int) {
            if (img->inRange(x, y))
                return img->data[img->pix(x, y)]
            return 0
        }

        /**
         * Fill entire image with a given color
         */
        //%
        fill(c: color) {
            img->data.fill(img->color(c))
        }

        /**
         * Fill a rectangle
         */
        //%
        fillRect(x: int, y: int, w: int, h: int, c: color) {
            let [x2, y2] = img->clamp(x + w - 1, y + h - 1);
            [x, y] = img->clamp(x, y)
            let p = img->pix(x, y)
            w = x2 - x + 1
            h = y2 - y + 1
            let d = img->_width - w
            c = img->color(c)
            while (h-- > 0) {
                for (let i = 0; i < w; ++i)
                    img->data[p++] = c
                p += d
            }
        }

        /**
         * Return a copy of the current image
         */
        //%
        clone() {
            let r = new Image(img->_width, img->_height)
            r.data.set(img->data)
            return r
        }

        /**
         * Flips (mirrors) pixels horizontally in the current image
         */
        //%
        flipX() {
            const w = img->_width
            const h = img->_height
            for (let i = 0; i < h; ++i) {
                img->data.subarray(i * w, (i + 1) * w).reverse()
            }
        }


        /**
         * Flips (mirrors) pixels vertically in the current image
         */
        //%
        flipY() {
            const w = img->_width
            const h = img->_height
            const d = img->data
            for (let i = 0; i < w; ++i) {
                let top = i
                let bot = i + (h - 1) * w
                while (top < bot) {
                    let c = d[top]
                    d[top] = d[bot]
                    d[bot] = c
                    top += w
                    bot -= w
                }
            }
        }

        /**
         * Every pixel in image is moved by (dx,dy)
         */
        //%
        scroll(dx: int, dy: int) {
            dx |= 0
            dy |= 0
            if (dy < 0) {
                dy = -dy
                if (dy < img->_height)
                    img->data.copyWithin(0, dy * img->_width)
                else
                    dy = img->_height
                img->data.fill(0, (img->_height - dy) * img->_width)
            } else if (dy > 0) {
                if (dy < img->_height)
                    img->data.copyWithin(dy * img->_width, 0)
                else
                    dy = img->_height
                img->data.fill(0, 0, dy * img->_width)
            }
            // TODO implement dx
        }

        /**
         * Stretches the image horizontally by 100%
         */
        //%
        doubleX() {
            const w = img->_width
            const h = img->_height
            const d = img->data
            const n = new Uint8Array(w * h * 2)
            let dst = 0

            for (let src = 0; src < d.length; ++src) {
                let c = d[src]
                n[dst++] = c
                n[dst++] = c
            }

            img->_width = w * 2
            img->data = n
        }

        /**
         * Stretches the image vertically by 100%
         */
        //%
        doubleY() {
            const w = img->_width
            const h = img->_height
            const d = img->data
            const n = new Uint8Array(w * h * 2)
            let src = 0
            let dst0 = 0
            let dst1 = w
            for (let i = 0; i < h; ++i) {
                for (let j = 0; j < w; ++j) {
                    let c = d[src++]
                    n[dst0++] = c
                    n[dst1++] = c
                }
                dst0 += w
                dst1 += w
            }
            img->_height = h * 2
            img->data = n
        }


        /**
         * Stretches the image in both directions by 100%
         */
        //%
        double() {
            img->doubleX()
            img->doubleY()
        }

        /**
         * Draw given image on the current image
         */
        //%
        drawImage(from: Image, x: int, y: int) {
            x |= 0
            y |= 0

            const w = from._width
            let h = from._height
            const sh = img->_height
            const sw = img->_width

            if (x + w <= 0) return
            if (x >= sw) return
            if (y + h <= 0) return
            if (y >= sh) return

            const len = x < 0 ? Math.min(sw, w + x) : Math.min(sw - x, w)
            const fdata = from.data
            const tdata = img->data

            for (let p = 0; h--; y++ , p += w) {
                if (0 <= y && y < sh) {
                    let dst = y * sw
                    let src = p
                    if (x < 0)
                        src += -x
                    else
                        dst += x
                    for (let i = 0; i < len; ++i) {
                        const v = fdata[src++]
                        if (v)
                            tdata[dst] = v
                        dst++
                    }
                }
            }
        }

        /**
         * Check if the current image "collides" with another
         */
        //%
        overlapsWith(other: Image, x: int, y: int) {
            x |= 0
            y |= 0

            const w = other._width
            let h = other._height
            const sh = img->_height
            const sw = img->_width

            if (x + w <= 0) return false
            if (x >= sw) return false
            if (y + h <= 0) return false
            if (y >= sh) return false

            const len = x < 0 ? Math.min(sw, w + x) : Math.min(sw - x, w)
            const fdata = other.data
            const tdata = img->data

            for (let p = 0; h--; y++ , p += w) {
                if (0 <= y && y < sh) {
                    let dst = y * sw
                    let src = p
                    if (x < 0)
                        src += -x
                    else
                        dst += x
                    for (let i = 0; i < len; ++i) {
                        const v = fdata[src++]
                        if (v && tdata[dst])
                            return true
                        dst++
                    }
                }
            }

            return false
        }


        // Image format:
        //  byte 0: magic 0xf4 - 4 bit color; 0xf0 is monochromatic
        //  byte 1: width in pixels
        //  byte 2...N: data 4 bits per pixels, high order nibble printed first, lines aligned to byte
        //  byte 2...N: data 1 bit per pixels, low order bit printed first, lines aligned to byte

        /**
         * Draw an icon (monochromatic image) using given color
         */
        //%
        drawIcon(icon: RefBuffer, x: int, y: int, color: color) {
            const img = icon.data
            if (!img || img.length < 3 || img[0] != 0xf0)
                return
            let w = img[1]
            let byteW = (w + 7) >> 3
            let h = ((img.length - 2) / byteW) | 0
            if (h == 0)
                return

            x |= 0
            y |= 0
            const sh = img->_height
            const sw = img->_width

            if (x + w <= 0) return
            if (x >= sw) return
            if (y + h <= 0) return
            if (y >= sh) return

            let p = 2
            color = img->color(color)
            const screen = img->data

            for (let i = 0; i < h; ++i) {
                let yy = y + i
                if (0 <= yy && yy < sh) {
                    let dst = yy * sw
                    let src = p
                    let xx = x
                    let end = Math.min(sw, w + x)
                    if (x < 0) {
                        src += ((-x) >> 3)
                        xx += ((-x) >> 3) * 8
                    }
                    dst += xx
                    let mask = 0x01
                    let v = img[src++]
                    while (xx < end) {
                        if (xx >= 0 && (v & mask)) {
                            screen[dst] = color
                        }
                        mask <<= 1
                        if (mask & 0x100) {
                            mask = 0x01
                            v = img[src++]
                        }
                        dst++
                        xx++
                    }
                }
                p += byteW
            }
        }


        pix(x: int, y: int) {
            return (x | 0) + (y | 0) * img->_width
        }

        inRange(x: int, y: int) {
            return 0 <= (x | 0) && (x | 0) < img->_width &&
                0 <= (y | 0) && (y | 0) < img->_height;
        }

        color(c: color): int {
            return c & 0xff
        }

        clamp(x: int, y: int) {
            x |= 0
            y |= 0

            if (x < 0) x = 0
            else if (x >= img->_width)
                x = img->_width - 1

            if (y < 0) y = 0
            else if (y >= img->_height)
                y = img->_height - 1

            return [x, y]
        }


}
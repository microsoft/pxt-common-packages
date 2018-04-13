namespace pxsim {
    export class RefImage {
        _width: number;
        _height: number;
        _bpp: number;
        data: Uint8Array;
        dirty = true

        constructor(w: number, h: number, bpp: number) {
            this.data = new Uint8Array(w * h)
            this._width = w
            this._height = h
            this._bpp = bpp
        }

        pix(x: number, y: number) {
            return (x | 0) + (y | 0) * this._width
        }

        inRange(x: number, y: number) {
            return 0 <= (x | 0) && (x | 0) < this._width &&
                0 <= (y | 0) && (y | 0) < this._height;
        }

        color(c: number): number {
            return c & 0xff
        }

        clamp(x: number, y: number) {
            x |= 0
            y |= 0

            if (x < 0) x = 0
            else if (x >= this._width)
                x = this._width - 1

            if (y < 0) y = 0
            else if (y >= this._height)
                y = this._height - 1

            return [x, y]
        }

        makeWritable() {
            this.dirty = true
        }
    }
}

namespace pxsim.ImageMethods {
    function XX(x: number) { return (x << 16) >> 16 }
    function YY(x: number) { return x >> 16 }

    export function width(img: RefImage) { return img._width }

    export function height(img: RefImage) { return img._height }

    export function isMono(img: RefImage) { return img._bpp == 1 }

    export function setPixel(img: RefImage, x: number, y: number, c: number) {
        img.makeWritable()
        if (img.inRange(x, y))
            img.data[img.pix(x, y)] = img.color(c)
    }

    export function getPixel(img: RefImage, x: number, y: number) {
        if (img.inRange(x, y))
            return img.data[img.pix(x, y)]
        return 0
    }

    export function fill(img: RefImage, c: number) {
        img.makeWritable()
        img.data.fill(img.color(c))
    }

    export function fillRect(img: RefImage, x: number, y: number, w: number, h: number, c: number) {
        img.makeWritable()
        let [x2, y2] = img.clamp(x + w - 1, y + h - 1);
        [x, y] = img.clamp(x, y)
        let p = img.pix(x, y)
        w = x2 - x + 1
        h = y2 - y + 1
        let d = img._width - w
        c = img.color(c)
        while (h-- > 0) {
            for (let i = 0; i < w; ++i)
                img.data[p++] = c
            p += d
        }
    }

    export function _fillRect(img: RefImage, xy: number, wh: number, c: number) {
        fillRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c)
    }

    export function clone(img: RefImage) {
        let r = new RefImage(img._width, img._height, img._bpp)
        r.data.set(img.data)
        return r
    }

    export function flipX(img: RefImage) {
        img.makeWritable()
        const w = img._width
        const h = img._height
        for (let i = 0; i < h; ++i) {
            img.data.subarray(i * w, (i + 1) * w).reverse()
        }
    }


    export function flipY(img: RefImage) {
        img.makeWritable()
        const w = img._width
        const h = img._height
        const d = img.data
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

    export function scroll(img: RefImage, dx: number, dy: number) {
        img.makeWritable()
        dx |= 0
        dy |= 0
        if (dy < 0) {
            dy = -dy
            if (dy < img._height)
                img.data.copyWithin(0, dy * img._width)
            else
                dy = img._height
            img.data.fill(0, (img._height - dy) * img._width)
        } else if (dy > 0) {
            if (dy < img._height)
                img.data.copyWithin(dy * img._width, 0)
            else
                dy = img._height
            img.data.fill(0, 0, dy * img._width)
        }
        // TODO implement dx
    }

    export function replace(img: RefImage, from: number, to: number) {
        to &= 0xf;
        const d = img.data
        for (let i = 0; i < d.length; ++i)
            if (d[i] == from) d[i] = to
    }

    export function doubledX(img: RefImage) {
        const w = img._width
        const h = img._height
        const d = img.data
        const r = new RefImage(w * 2, h, img._bpp)
        const n = r.data
        let dst = 0

        for (let src = 0; src < d.length; ++src) {
            let c = d[src]
            n[dst++] = c
            n[dst++] = c
        }

        return r
    }

    export function doubledY(img: RefImage) {
        const w = img._width
        const h = img._height
        const d = img.data
        const r = new RefImage(w, h * 2, img._bpp)
        const n = r.data

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

        return r
    }


    export function doubled(img: RefImage) {
        return doubledX(doubledY(img))
    }

    function drawImageCore(img: RefImage, from: RefImage, x: number, y: number, clear: boolean, check: boolean) {
        x |= 0
        y |= 0

        const w = from._width
        let h = from._height
        const sh = img._height
        const sw = img._width

        if (x + w <= 0) return false
        if (x >= sw) return false
        if (y + h <= 0) return false
        if (y >= sh) return false

        if (clear)
            fillRect(img, x, y, from._width, from._height, 0)
        else if (!check)
            img.makeWritable()

        const len = x < 0 ? Math.min(sw, w + x) : Math.min(sw - x, w)
        const fdata = from.data
        const tdata = img.data

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
                    if (v) {
                        if (check) {
                            if (tdata[dst])
                                return true
                        } else {
                            tdata[dst] = v
                        }
                    }
                    dst++
                }
            }
        }

        return false
    }

    export function drawImage(img: RefImage, from: RefImage, x: number, y: number) {
        drawImageCore(img, from, x, y, true, false)
    }

    export function drawTransparentImage(img: RefImage, from: RefImage, x: number, y: number) {
        drawImageCore(img, from, x, y, false, false)
    }

    export function overlapsWith(img: RefImage, other: RefImage, x: number, y: number) {
        return drawImageCore(img, other, x, y, false, true)
    }

    function drawLineLow(img: RefImage, x0: number, y0: number, x1: number, y1: number, c: number) {
        let dx = x1 - x0;
        let dy = y1 - y0;
        let yi = img._width;
        if (dy < 0) {
            yi = -yi;
            dy = -dy;
        }
        let D = 2 * dy - dx;
        dx <<= 1;
        dy <<= 1;
        c = img.color(c);
        let ptr = img.pix(x0, y0)
        for (let x = x0; x <= x1; ++x) {
            img.data[ptr] = c
            if (D > 0) {
                ptr += yi;
                D -= dx;
            }
            D += dy;
            ptr++;
        }
    }

    function drawLineHigh(img: RefImage, x0: number, y0: number, x1: number, y1: number, c: number) {
        let dx = x1 - x0;
        let dy = y1 - y0;
        let xi = 1;
        if (dx < 0) {
            xi = -1;
            dx = -dx;
        }
        let D = 2 * dx - dy;
        dx <<= 1;
        dy <<= 1;
        c = img.color(c);
        let ptr = img.pix(x0, y0);
        for (let y = y0; y <= y1; ++y) {
            img.data[ptr] = c;
            if (D > 0) {
                ptr += xi;
                D -= dy;
            }
            D += dx;
            ptr += img._width;
        }
    }

    export function _drawLine(img: RefImage, xy: number, wh: number, c: number) {
        drawLine(img, XX(xy), YY(xy), XX(wh), YY(wh), c)
    }

    export function drawLine(img: RefImage, x0: number, y0: number, x1: number, y1: number, c: number) {
        x0 |= 0
        y0 |= 0
        x1 |= 0
        y1 |= 0

        if (x1 < x0) {
            drawLine(img, x1, y1, x0, y0, c);
            return;
        }

        let w = x1 - x0;
        let h = y1 - y0;

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

        if (x1 < 0 || x0 >= img._width)
            return;
        if (x0 < 0) {
            y0 -= (h * x0 / w) | 0;
            x0 = 0;
        }
        if (x1 >= img._width) {
            let d = (img._width - 1) - x1;
            y1 += (h * d / w) | 0;
            x1 = img._width - 1
        }

        if (y0 < y1) {
            if (y0 >= img._height || y1 < 0)
                return;
            if (y0 < 0) {
                x0 -= (w * y0 / h) | 0;
                y0 = 0;
            }
            if (y1 >= img._height) {
                let d = (img._height - 1) - y1;
                x1 += (w * d / h) | 0;
                y1 = img._height
            }
        } else {
            if (y1 >= img._height || y0 < 0)
                return;
            if (y1 < 0) {
                x1 -= (w * y1 / h) | 0;
                y1 = 0;
            }
            if (y0 >= img._height) {
                let d = (img._height - 1) - y0;
                x0 += (w * d / h) | 0;
                y0 = img._height
            }
        }

        img.makeWritable()

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

    export function drawIcon(img: RefImage, icon: RefBuffer, x: number, y: number, color: number) {
        const img2 = icon.data
        if (!img2 || img2.length < 5 || img2[0] != 0xe1)
            return
        let w = img2[1]
        let h = img2[2]
        let byteH = (h + 7) >> 3

        x |= 0
        y |= 0
        const sh = img._height
        const sw = img._width

        if (x + w <= 0) return
        if (x >= sw) return
        if (y + h <= 0) return
        if (y >= sh) return

        img.makeWritable()

        let p = 4
        color = img.color(color)
        const screen = img.data

        for (let i = 0; i < w; ++i) {
            let xxx = x + i
            if (0 <= xxx && xxx < sw) {
                let dst = xxx + y * sw
                let src = p
                let yy = y
                let end = Math.min(sh, h + y)
                if (y < 0) {
                    src += ((-y) >> 3)
                    yy += ((-y) >> 3) * 8
                }
                let mask = 0x01
                let v = img2[src++]
                while (yy < end) {
                    if (yy >= 0 && (v & mask)) {
                        screen[dst] = color
                    }
                    mask <<= 1
                    if (mask == 0x100) {
                        mask = 0x01
                        v = img2[src++]
                    }
                    dst += sw
                    yy++
                }
            }
            p += byteH
        }
    }

    export function _drawIcon(img: RefImage, icon: RefBuffer, xy: number, color: number) {
        drawIcon(img, icon, XX(xy), YY(xy), color)
    }
}


namespace pxsim.image {
    function byteWidth(h: number, bpp: number) {
        if (bpp == 1)
            return h * bpp + 7 >> 3
        else
            return ((h * bpp + 31) >> 5) << 2
    }

    function isValidImage(buf: RefBuffer) {
        if (!buf || buf.data.length < 4)
            return false;

        if (buf.data[0] != 0xe1 && buf.data[0] != 0xe4)
            return false;

        const bpp = buf.data[0] & 0xf;
        const sz = buf.data[1] * byteWidth(buf.data[2], bpp)
        if (4 + sz != buf.data.length)
            return false;

        return true;
    }


    export function create(w: number, h: number) {
        return new RefImage(w, h, getScreenState().bpp())
    }

    export function ofBuffer(buf: RefBuffer): RefImage {
        if (!isValidImage(buf))
            return null
        const src: Uint8Array = buf.data
        const w = src[1]
        const h = src[2]
        if (w == 0 || h == 0)
            return null
        const bpp = src[0] & 0xf;
        const r = new RefImage(w, h, bpp)
        const dst = r.data

        let srcP = 4

        if (bpp == 1) {
            for (let i = 0; i < w; ++i) {
                let dstP = i
                let mask = 0x01
                let v = src[srcP++]
                for (let j = 0; j < h; ++j) {
                    if (mask == 0x100) {
                        mask = 0x01
                        v = src[srcP++]
                    }
                    if (v & mask)
                        dst[dstP] = 1
                    dstP += w
                    mask <<= 1
                }
            }
        } else if (bpp == 4) {
            for (let i = 0; i < w; ++i) {
                let dstP = i
                for (let j = 0; j < h >> 1; ++j) {
                    const v = src[srcP++]
                    dst[dstP] = v & 0xf
                    dstP += w
                    dst[dstP] = v >> 4
                    dstP += w
                }
                if (h & 1)
                    dst[dstP] = src[srcP++] & 0xf
                srcP = (srcP + 3) & ~3
            }
        }

        return r
    }


    export function toBuffer(img: RefImage): RefBuffer {
        let col = byteWidth(img._height, img._bpp)
        let sz = 4 + img._width * col
        let r = new Uint8Array(sz)
        r[0] = 0xe0 | img._bpp
        r[1] = img._width
        r[2] = img._height
        let dstP = 4
        const w = img._width
        const h = img._height
        const data = img.data
        for (let i = 0; i < w; ++i) {
            if (img._bpp == 4) {
                let p = i
                for (let j = 0; j < h; j += 2) {
                    r[dstP++] = ((data[p + 1] & 0xf) << 4) | ((data[p] || 0) & 0xf)
                    p += 2 * w
                }
                dstP = (dstP + 3) & ~3
            } else if (img._bpp == 1) {
                let mask = 0x01
                let p = i
                for (let j = 0; j < h; j++) {
                    if (data[p])
                        r[dstP] |= mask
                    mask <<= 1
                    p += w
                    if (mask == 0x100) {
                        mask = 0x01
                        dstP++
                    }
                }
                if (mask != 0x01)
                    dstP++
            }
        }

        return new RefBuffer(r)
    }

    export function doubledIcon(buf: RefBuffer): RefBuffer {
        let img = ofBuffer(buf)
        if (!img)
            return null
        img = ImageMethods.doubled(img)
        return toBuffer(img)
    }
}

namespace pxsim.pxtcore {
    export function updateScreen(img: RefImage) {
        getScreenState().showImage(img)
    }
    export function updateStats(s: string) {
        getScreenState().updateStats(s);
    }
    export function setPalette(b: RefBuffer) {
        getScreenState().setPalette(b)
    }
}
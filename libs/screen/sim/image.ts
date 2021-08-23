namespace pxsim {
    export class RefImage extends RefObject {
        _width: number;
        _height: number;
        _bpp: number;
        data: Uint8Array;
        isStatic = true;
        revision: number;

        constructor(w: number, h: number, bpp: number) {
            super();
            this.revision = 0;
            this.data = new Uint8Array(w * h)
            this._width = w
            this._height = h
            this._bpp = bpp
        }

        scan(mark: (path: string, v: any) => void) { }
        gcKey() { return "Image" }
        gcSize() { return 4 + (this.data.length + 3 >> 3) }
        gcIsStatic() { return this.isStatic }

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
            this.revision++;
            this.isStatic = false
        }

        toDebugString() {
            return this._width + "x" + this._height
        }
    }
}

namespace pxsim.ImageMethods {
    function XX(x: number) { return (x << 16) >> 16 }
    function YY(x: number) { return x >> 16 }

    export function width(img: RefImage) { return img._width }

    export function height(img: RefImage) { return img._height }

    export function isMono(img: RefImage) { return img._bpp == 1 }

    export function isStatic(img: RefImage) { return img.gcIsStatic() }

    export function revision(img: RefImage) { return img.revision }

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
        if (w == 0 || h == 0 || x >= img._width || y >= img._height || x + w - 1 < 0 || y + h - 1 < 0)
            return;
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

    export function mapRect(img: RefImage, x: number, y: number, w: number, h: number, c: RefBuffer) {
        if (c.data.length < 16)
            return
        img.makeWritable()
        let [x2, y2] = img.clamp(x + w - 1, y + h - 1);
        [x, y] = img.clamp(x, y)
        let p = img.pix(x, y)
        w = x2 - x + 1
        h = y2 - y + 1
        let d = img._width - w

        while (h-- > 0) {
            for (let i = 0; i < w; ++i) {
                img.data[p] = c.data[img.data[p]]
                p++
            }
            p += d
        }
    }

    export function _mapRect(img: RefImage, xy: number, wh: number, c: RefBuffer) {
        mapRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c)
    }

    export function equals(img: RefImage, other: RefImage) {
        if (!other || img._bpp != other._bpp || img._width != other._width || img._height != other._height) {
            return false;
        }
        let imgData = img.data;
        let otherData = other.data;
        let len = imgData.length;
        for (let i = 0; i < len; i++) {
            if (imgData[i] != otherData[i]) {
                return false;
            }
        }
        return true;
    }

    export function getRows(img: RefImage, x: number, dst: RefBuffer) {
        x |= 0
        if (!img.inRange(x, 0))
            return

        let dp = 0
        let len = Math.min(dst.data.length, (img._width - x) * img._height)
        let sp = x
        let hh = 0
        while (len--) {
            if (hh++ >= img._height) {
                hh = 0
                sp = ++x
            }
            dst.data[dp++] = img.data[sp]
            sp += img._width
        }
    }

    export function setRows(img: RefImage, x: number, src: RefBuffer) {
        x |= 0
        if (!img.inRange(x, 0))
            return

        let sp = 0
        let len = Math.min(src.data.length, (img._width - x) * img._height)
        let dp = x
        let hh = 0
        while (len--) {
            if (hh++ >= img._height) {
                hh = 0
                dp = ++x
            }
            img.data[dp] = src.data[sp++]
            dp += img._width
        }
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

    export function transposed(img: RefImage) {
        const w = img._width
        const h = img._height
        const d = img.data
        const r = new RefImage(h, w, img._bpp)
        const n = r.data
        let src = 0

        for (let i = 0; i < h; ++i) {
            let dst = i
            for (let j = 0; j < w; ++j) {
                n[dst] = d[src++]
                dst += w
            }
        }

        return r
    }

    export function copyFrom(img: RefImage, from: RefImage) {
        if (img._width != from._width || img._height != from._height ||
            img._bpp != from._bpp)
            return;
        img.data.set(from.data)
    }

    export function scroll(img: RefImage, dx: number, dy: number) {
        img.makeWritable()
        dx |= 0
        dy |= 0
        if (dx != 0) {
            const img2 = clone(img)
            img.data.fill(0)
            drawTransparentImage(img, img2, dx, dy)
        } else if (dy < 0) {
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
        const img2: Uint8Array = icon.data
        if (!image.isValidImage(icon))
            return
        if (img2[1] != 1)
            return // only mono
        let w = image.bufW(img2)
        let h = image.bufH(img2)
        let byteH = image.byteHeight(h, 1)

        x |= 0
        y |= 0
        const sh = img._height
        const sw = img._width

        if (x + w <= 0) return
        if (x >= sw) return
        if (y + h <= 0) return
        if (y >= sh) return

        img.makeWritable()

        let p = 8
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

    export function fillCircle(img: RefImage, cx: number, cy: number, r: number, c: number) {
        let x = r - 1;
        let y = 0;
        let dx = 1;
        let dy = 1;
        let err = dx - (r << 1);
        while (x >= y) {
            fillRect(img, cx + x, cy - y, 1, 1 + (y << 1), c);
            fillRect(img, cx + y, cy - x, 1, 1 + (x << 1), c);
            fillRect(img, cx - x, cy - y, 1, 1 + (y << 1), c);
            fillRect(img, cx - y, cy - x, 1, 1 + (x << 1), c);
            if (err <= 0) {
                y++;
                err += dy;
                dy += 2;
            }
            if (err > 0) {
                x--;
                dx += 2;
                err += dx - (r << 1);
            }
        }
    }

    export function _fillCircle(img: RefImage, cxy: number, r: number, c: number) {
        fillCircle(img, XX(cxy), YY(cxy), r, c);
    }

    export function _blitRow(img: RefImage, xy: number, from: RefImage, xh: number) {
        blitRow(img, XX(xy), YY(xy), from, XX(xh), YY(xh))
    }

    export function blitRow(img: RefImage, x: number, y: number, from: RefImage, fromX: number, fromH: number) {
        x |= 0
        y |= 0
        fromX |= 0
        fromH |= 0
        if (!img.inRange(x, 0) || !img.inRange(fromX, 0) || fromH <= 0)
            return
        let fy = 0
        let stepFY = ((from._width << 16) / fromH) | 0
        let endY = y + fromH
        if (endY > img._height)
            endY = img._height
        if (y < 0) {
            fy += -y * stepFY
            y = 0
        }
        while (y < endY) {
            img.data[img.pix(x, y)] = from.data[from.pix(fromX, fy >> 16)]
            y++
            fy += stepFY
        }
    }

    // This triangle rasterizer inspired by Juan Pineda's seminal 1988 SIGGRAPH paper.
    // https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.157.4621&rep=rep1&type=pdf

    type V2 = { x: number; y: number; };
    type V3 = { x: number; y: number; z: number };
    type Vertex = { pos: V2, uv: V2 };
    type Bounds = { left: number; top: number; right: number; bottom: number; };

    type DrawTriArgs = {
        verts: Vertex[],
        indices: number[],
        area: V2,
        dst: RefImage,
        tex: RefImage
    };

    function edge(a: V2, b: V2, c: V2): number {
        return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
    }
    function barycentric(p0: V2, p1: V2, p2: V2, p: V2, out: V3): boolean {
        const w0 = edge(p1, p2, p);
        if (w0 < 0) return false;
        const w1 = edge(p2, p0, p);
        if (w1 < 0) return false;
        const w2 = edge(p0, p1, p);
        if (w2 < 0) return false;
        out.x = w0;
        out.y = w1;
        out.z = w2;
        // point is in triangle (or on an edge of it)
        return true;
    }
    function clamp(v: number, min: number, max: number): number {
        return Math.min(max, Math.max(v, min));
    }
    function min3(a: number, b: number, c: number): number {
        return Math.min(Math.min(a, b), c);
    }
    function max3(a: number, b: number, c: number): number {
        return Math.max(Math.max(a, b), c);
    }
    function scaleToRef(v: V2, s: number, ref: V2): V2 {
        ref.x = v.x * s;
        ref.y = v.y * s;
        return ref;
    }
    function add3ToRef(a: V2, b: V2, c: V2, ref: V2): V2 {
        ref.x = a.x + b.x + c.x;
        ref.y = a.y + b.y + c.y;
        return ref;
    }
    function divToRef(a: V2, b: V2, ref: V2): V2 {
        ref.x = a.x / b.x;
        ref.y = a.y / b.y;
        return ref;
    }

    export function _drawQuad(dst: RefImage, tex: RefImage, args: RefCollection) {
        drawQuad(dst, tex, args);
    }

    function drawQuad(dst: RefImage, tex: RefImage, args: RefCollection) {
        /**
         * Quad layout (wound clockwise)
         * (i:0,uv:0,0) (i:1,uv:1,0)
         *   +------------+
         *   |\__         |
         *   |   \__      |
         *   |      \__   |
         *   |         \__|
         *   +------------+
         * (i:3,uv:0,1) (i:2,uv:1,1)
         */

        // Triangle indices. Triangles are wound counterclockwise.
        const TRI0_INDICES = [0, 3, 2];
        const TRI1_INDICES = [2, 1, 0];
    
        const leftTop: Vertex = {
            pos: { x: args.getAt(0) | 0, y: args.getAt(1) | 0 },
            uv: { x: 0, y: 0 }
        };
        const rightTop: Vertex = {
            pos: { x: args.getAt(2) | 0, y: args.getAt(3) | 0 },
            uv: { x: 1, y: 0 }
        };
        const rightBottom: Vertex = {
            pos: { x: args.getAt(4) | 0, y: args.getAt(5) | 0 },
            uv: { x: 1, y: 1 }
        }
        const leftBottom: Vertex = {
            pos: { x: args.getAt(6) | 0, y: args.getAt(7) | 0 },
            uv: { x: 0, y: 1 }
        };
        const verts = [leftTop, rightTop, rightBottom, leftBottom];

        // calc area of quad
        const a = edge(
            verts[TRI0_INDICES[0]].pos,
            verts[TRI0_INDICES[1]].pos,
            verts[TRI0_INDICES[2]].pos);
        if (a <= 0) return;
        const area: V2 = { x: a, y: a };

        drawTri({ verts, indices: TRI0_INDICES, area, dst, tex });
        drawTri({ verts, indices: TRI1_INDICES, area, dst, tex });
    }

    function drawTri(args: DrawTriArgs): void {
        const v0 = args.verts[args.indices[0]];
        const v1 = args.verts[args.indices[1]];
        const v2 = args.verts[args.indices[2]];
        // Temp vars
        const _uv0: V2 = { x: 0, y: 0 };
        const _uv1: V2 = { x: 0, y: 0 };
        const _uv2: V2 = { x: 0, y: 0 };
        const _uv: V2 = { x: 0, y: 0 };

        function shade(bary: V3): number {
            // Calculate uv coords from given barycentric coords.
            // TODO: Support different texture wrapping modes.
            scaleToRef(v0.uv, bary.x, _uv0);
            scaleToRef(v1.uv, bary.y, _uv1);
            scaleToRef(v2.uv, bary.z, _uv2);
            add3ToRef(_uv0, _uv1, _uv2, _uv);
            divToRef(_uv, args.area, _uv);
            // Sample texture at uv coords.
            const x = Math.floor(_uv.x * args.tex._width);
            const y = Math.floor(_uv.y * args.tex._height);
            return ImageMethods.getPixel(args.tex, x, y);
        }
        // get clipped bounds of tri
        const bounds: Bounds = {
            left: clamp(min3(v0.pos.x, v1.pos.x, v2.pos.x), 0, args.dst._width),
            top: clamp(min3(v0.pos.y, v1.pos.y, v2.pos.y), 0, args.dst._height),
            right: clamp(max3(v0.pos.x, v1.pos.x, v2.pos.x), 0, args.dst._width),
            bottom: clamp(max3(v0.pos.y, v1.pos.y, v2.pos.y), 0, args.dst._height),
        };
        const p: V2 = { x: bounds.left, y: bounds.top };
        const bary: V3 = { x: 0, y: 0, z: 0 };
        // TODO: This is a simplistic implementation that doesn't attempt to filter pixels outside the triangle.
        // We should do some prefiltering. This can be done using a tiled rendering approach for larger triangles.
        for (; p.y < bounds.bottom; ++p.y) {
            p.x = bounds.left;
            for (; p.x < bounds.right; ++p.x) {
                // TODO: This extremely expensive call to `barycentric` can be optimized out by predetermining
                // the gradients at setup and just adding them at each step. It's not as precise, but at this
                // small a screen resolution it should be unnoticable at even the largest triangle size.
                if (barycentric(v0.pos, v1.pos, v2.pos, p, bary)) {
                    const color = shade(bary);
                    if (color) {
                        ImageMethods.setPixel(args.dst, p.x, p.y, color);
                    }
                }
            }
        }
    }
}

namespace pxsim.image {
    export function byteHeight(h: number, bpp: number) {
        if (bpp == 1)
            return h * bpp + 7 >> 3
        else
            return ((h * bpp + 31) >> 5) << 2
    }

    function isLegacyImage(buf: RefBuffer) {
        if (!buf || buf.data.length < 5)
            return false;

        if (buf.data[0] != 0xe1 && buf.data[0] != 0xe4)
            return false;

        const bpp = buf.data[0] & 0xf;
        const sz = buf.data[1] * byteHeight(buf.data[2], bpp)
        if (4 + sz != buf.data.length)
            return false;

        return true;
    }

    export function bufW(data: Uint8Array) {
        return data[2] | (data[3] << 8)
    }

    export function bufH(data: Uint8Array) {
        return data[4] | (data[5] << 8)
    }

    export function isValidImage(buf: RefBuffer) {
        if (!buf || buf.data.length < 5)
            return false;

        if (buf.data[0] != 0x87)
            return false

        if (buf.data[1] != 1 && buf.data[1] != 4)
            return false;

        const bpp = buf.data[1];
        const sz = bufW(buf.data) * byteHeight(bufH(buf.data), bpp)
        if (8 + sz != buf.data.length)
            return false;

        return true;
    }


    export function create(w: number, h: number) {
        return new RefImage(w, h, getScreenState().bpp())
    }

    export function ofBuffer(buf: RefBuffer): RefImage {
        const src: Uint8Array = buf.data

        let srcP = 4
        let w = 0, h = 0, bpp = 0

        if (isLegacyImage(buf)) {
            w = src[1]
            h = src[2]
            bpp = src[0] & 0xf;
            // console.log("using legacy image")
        } else if (isValidImage(buf)) {
            srcP = 8
            w = bufW(src)
            h = bufH(src)
            bpp = src[1]
        }

        if (w == 0 || h == 0)
            return null
        const r = new RefImage(w, h, bpp)
        const dst = r.data

        r.isStatic = buf.isStatic

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
        let col = byteHeight(img._height, img._bpp)
        let sz = 8 + img._width * col
        let r = new Uint8Array(sz)
        r[0] = 0x87
        r[1] = img._bpp
        r[2] = img._width & 0xff
        r[3] = img._width >> 8
        r[4] = img._height & 0xff
        r[5] = img._height >> 8
        let dstP = 8
        const w = img._width
        const h = img._height
        const data = img.data
        for (let i = 0; i < w; ++i) {
            if (img._bpp == 4) {
                let p = i
                for (let j = 0; j < h; j += 2) {
                    r[dstP++] = ((data[p + w] & 0xf) << 4) | ((data[p] || 0) & 0xf)
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
        const state = getScreenState();
        if (state)
            state.showImage(img)
    }
    export function updateStats(s: string) {
        const state = getScreenState();
        if (state)
            state.updateStats(s);
    }
    export function setPalette(b: RefBuffer) {
        const state = getScreenState();
        if (state)
            state.setPalette(b)
    }
    export function setupScreenStatusBar(barHeight: number) {
        const state = getScreenState();
        if (state)
            state.setupScreenStatusBar(barHeight);
    }
    export function updateScreenStatusBar(img: RefImage) {
        const state = getScreenState();
        if (state)
            state.updateScreenStatusBar(img);
    }
    export function setScreenBrightness(b: number) {
        // I guess we could at least turn the screen off, when b==0,
        // otherwise, it probably doesn't make much sense to do anything.
        const state = getScreenState();
        if (state)
            state.setScreenBrightness(b);
    }
}

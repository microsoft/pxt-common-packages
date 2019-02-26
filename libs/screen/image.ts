type color = number

namespace image {
    export function repeatY(count: number, image: Image) {
        let arr = [image]
        while (--count > 0)
            arr.push(image)
        return concatY(arr)
    }

    export function concatY(images: Image[]) {
        let w = 0
        let h = 0
        for (let img of images) {
            w = Math.max(img.width, w)
            h += img.height
        }
        let r = image.create(w, h)
        let y = 0
        for (let img of images) {
            let x = (w - img.width) >> 1
            r.drawImage(img, x, y)
            y += img.height
        }
        return r
    }
}


//% fixedInstances
interface Image {
    /**
     * Draw an icon (monochromatic image) using given color
     */
    //% helper=imageDrawIcon
    drawIcon(icon: Buffer, x: number, y: number, c: color): void;

    /**
     * Fill a rectangle
     */
    //% helper=imageFillRect
    fillRect(x: number, y: number, w: number, h: number, c: color): void;

    /**
     * Draw a line
     */
    //% helper=imageDrawLine
    drawLine(x0: number, y0: number, x1: number, y1: number, c: color): void;

    /**
     * Draw an empty rectangle
     */
    //% helper=imageDrawRect
    drawRect(x: number, y: number, w: number, h: number, c: color): void;

    /**
     * Draw a circle
     */
    //% helper=imageDrawCircle
    drawCircle(cx: number, cy: number, r: number, c: color): void;

    /**
     * Fills a circle
     */
    //% helper=imageFillCircle
    fillCircle(cx: number, cy: number, r: number, c: color): void;

    /**
     * Returns an image rotated by -90, 0, 90, 180, 270 deg clockwise
     */
    //% helper=imageRotated
    rotated(deg: number): Image;
}

interface ScreenImage extends Image {
    /**
     * Sets the screen backlight brightness (0-100)
     */
    //% helper=setScreenBrightness
    setBrightness(deg: number): Image;

    /**
     * Gets current screen backlight brightness (0-100)
     */
    //% helper=screenBrightness
    brightness(): number;
}

// pxt compiler currently crashes on non-functions in helpers namespace; will fix
namespace _helpers_workaround {
    export let brightness = 100
}

namespace helpers {
    //% shim=ImageMethods::_drawLine
    function _drawLine(img: Image, xy: number, wh: number, c: color): void { }

    //% shim=ImageMethods::_fillRect
    function _fillRect(img: Image, xy: number, wh: number, c: color): void { }

    //% shim=ImageMethods::_mapRect
    function _mapRect(img: Image, xy: number, wh: number, m: Buffer): void { }

    //% shim=ImageMethods::_drawIcon
    function _drawIcon(img: Image, icon: Buffer, xy: number, c: color): void { }

    function pack(x: number, y: number) {
        return (Math.clamp(-30000, 30000, x | 0) & 0xffff) | (Math.clamp(-30000, 30000, y | 0) << 16)
    }

    export function imageDrawIcon(img: Image, icon: Buffer, x: number, y: number, c: color): void {
        _drawIcon(img, icon, pack(x, y), c)
    }
    export function imageFillRect(img: Image, x: number, y: number, w: number, h: number, c: color): void {
        _fillRect(img, pack(x, y), pack(w, h), c)
    }
    export function imageMapRect(img: Image, x: number, y: number, w: number, h: number, m: Buffer): void {
        _mapRect(img, pack(x, y), pack(w, h), m)
    }
    export function imageDrawLine(img: Image, x: number, y: number, w: number, h: number, c: color): void {
        _drawLine(img, pack(x, y), pack(w, h), c)
    }
    export function imageDrawRect(img: Image, x: number, y: number, w: number, h: number, c: color): void {
        if (w == 0 || h == 0) return
        w--
        h--
        imageDrawLine(img, x, y, x + w, y, c)
        imageDrawLine(img, x, y, x, y + h, c)
        imageDrawLine(img, x + w, y + h, x + w, y, c)
        imageDrawLine(img, x + w, y + h, x, y + h, c)
    }

    export function imageDrawCircle(img: Image, cx: number, cy: number, r: number, col: number) {
        cx = cx | 0;
        cy = cy | 0;
        r = r | 0;
        // short cuts
        if (r == 0) {
            img.setPixel(cx, cy, col);
            return;
        } else if (r == 1) {
            img.setPixel(cx + 1, cy, col);
            img.setPixel(cx, cy + 1, col);
            img.setPixel(cx - 1, cy, col);
            img.setPixel(cx, cy - 1, col);
            return;
        }

        const fcx = Fx8(cx);
        const fcy = Fx8(cy);
        const fr = Fx8(r);
        const fr2 = Fx.leftShift(fr, 1);

        let x = Fx.sub(fr, Fx.oneFx8)
        let y = Fx.zeroFx8;
        let dx = Fx.oneFx8;
        let dy = Fx.oneFx8;
        let err = Fx.sub(dx, fr2);
        while (Fx.compare(x, y) >= 0) {
            const cxpx = Fx.toInt(Fx.add(fcx, x));
            const cxpy = Fx.toInt(Fx.add(fcx, y));
            const cxmx = Fx.toInt(Fx.sub(fcx, x));
            const cxmy = Fx.toInt(Fx.sub(fcx, y));
            const cypy = Fx.toInt(Fx.add(fcy, y));
            const cymy = Fx.toInt(Fx.sub(fcy, y));
            const cypx = Fx.toInt(Fx.add(fcy, x));
            const cymx = Fx.toInt(Fx.sub(fcy, x));

            img.setPixel(cxpx, cypy, col);
            img.setPixel(cxmx, cypy, col);
            img.setPixel(cxmx, cymy, col);
            img.setPixel(cxpx, cymy, col);
            img.setPixel(cxpy, cypx, col);
            img.setPixel(cxpy, cymx, col);
            img.setPixel(cxmy, cymx, col);
            img.setPixel(cxmy, cypx, col);

            if (Fx.compare(err, Fx.zeroFx8) <= 0) {
                y = Fx.add(y, Fx.oneFx8);
                err = Fx.add(err, dy);
                dy = Fx.add(dy, Fx.twoFx8);
            } else {
                x = Fx.sub(x, Fx.oneFx8);
                dx = Fx.add(dx, Fx.twoFx8);
                err = Fx.add(err, Fx.sub(dx, fr2));
            }
        }
    }
    export function imageFillCircle(img: Image, cx: number, cy: number, r: number, col: number) {
        cx = cx | 0;
        cy = cy | 0;
        r = r | 0;
        // short cuts
        if (r == 0) {
            img.setPixel(cx, cy, col);
            return;
        } else if (r == 1) {
            img.setPixel(cx, cy, col);
            img.setPixel(cx + 1, cy, col);
            img.setPixel(cx, cy + 1, col);
            img.setPixel(cx - 1, cy, col);
            img.setPixel(cx, cy - 1, col);
            return;
        }

        const fcx = Fx8(cx);
        const fcy = Fx8(cy);
        const fr = Fx8(r);
        const fr2 = Fx.leftShift(fr, 1);

        let x = Fx.sub(fr, Fx.oneFx8)
        let y = Fx.zeroFx8;
        let dx = Fx.oneFx8;
        let dy = Fx.oneFx8;
        let err = Fx.sub(dx, fr2);
        while (Fx.compare(x, y) >= 0) {
            const cxpx = Fx.toInt(Fx.add(fcx, x));
            const cxpy = Fx.toInt(Fx.add(fcx, y));
            const cxmx = Fx.toInt(Fx.sub(fcx, x));
            const cxmy = Fx.toInt(Fx.sub(fcx, y));
            const cypy = Fx.toInt(Fx.add(fcy, y));
            const cymy = Fx.toInt(Fx.sub(fcy, y));
            const cypx = Fx.toInt(Fx.add(fcy, x));
            const cymx = Fx.toInt(Fx.sub(fcy, x));

            if (Fx.compare(err, Fx.zeroFx8) <= 0) {
                img.drawLine(cxmx, cypy, cxpx, cypy, col)
                img.drawLine(cxmx, cymy, cxpx, cymy, col)

                y = Fx.add(y, Fx.oneFx8);
                err = Fx.add(err, dy);
                dy = Fx.add(dy, Fx.twoFx8);
            } else {
                img.drawLine(cxmy, cymx, cxmy, cypx, col)
                img.drawLine(cxpy, cymx, cxpy, cypx, col)

                x = Fx.sub(x, Fx.oneFx8);
                dx = Fx.add(dx, Fx.twoFx8);
                err = Fx.add(err, Fx.sub(dx, fr2));
            }
        }
    }

    /**
     * Returns an image rotated by 90, 180, 270 deg clockwise
     */
    export function imageRotated(img: Image, deg: number) {
        if (deg == -90 || deg == 270) {
            let r = img.transposed();
            r.flipY();
            return r;
        } else if (deg == 180 || deg == -180) {
            let r = img.clone();
            r.flipX();
            r.flipY();
            return r;
        } else if (deg == 90) {
            let r = img.transposed();
            r.flipX();
            return r;
        } else {
            return null;
        }
    }

    //% shim=pxt::setScreenBrightness
    function _setScreenBrightness(brightness: number) { }

    export function setScreenBrightness(img: Image, b: number) {
        _helpers_workaround.brightness = b
        _setScreenBrightness(_helpers_workaround.brightness)
    }

    export function screenBrightness(img: Image) {
        return _helpers_workaround.brightness
    }
}

namespace image {
    /**
    * Get the screen image
    */
    //% blockNamespace="images" group="Create"
    //% blockId=imagescreen block="screen"
    //% help=images/screen-image
    export function screenImage(): Image {
        return screen;
    }
}

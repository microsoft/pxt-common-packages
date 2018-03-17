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
}

namespace helpers {
    //% shim=ImageMethods::_drawLine
    function _drawLine(img: Image, xy: number, wh: number, c: color): void { }

    //% shim=ImageMethods::_fillRect
    function _fillRect(img: Image, xy: number, wh: number, c: color): void { }

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
}


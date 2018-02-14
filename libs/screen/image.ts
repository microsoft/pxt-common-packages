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
            w = Math.max(img.width(), w)
            h += img.height()
        }
        let r = image.create(w, h)
        let y = 0
        for (let img of images) {
            let x = (w - img.width()) >> 1
            r.drawImage(img, x, y)
            y += img.height()
        }
        return r
    }
}


interface Image {
    /**
     * Draw an icon (monochromatic image) using given color
     */
    //% helper=imageDrawIcon
    drawIcon(icon: Image, x: int32, y: int32, c: color): void;

    /**
     * Fill a rectangle
     */
    //% helper=imageFillRect
    fillRect(x: int32, y: int32, w: int32, h: int32, c: color): void;
}

namespace helpers {
    //% shim=ImageMethods::_fillRect
    function _fillRect(img: Image, xy: int32, wh: int32, c: color): void { }

    //% shim=ImageMethods::_drawIcon
    function _drawIcon(img: Image, icon: Image, xy: int32, c: color): void { }

    function pack(x: number, y: number) {
        return (Math.clamp(-30000, 30000, x | 0) & 0xffff) | (Math.clamp(-30000, 30000, y | 0) << 16)
    }

    export function imageDrawIcon(img: Image, icon: Image, x: int32, y: int32, c: color): void {
        _drawIcon(img, icon, pack(x, y), c)
    }
    export function imageFillRect(img: Image, x: int32, y: int32, w: int32, h: int32, c: color): void {
        _fillRect(img, pack(x, y), pack(w, h), c)
    }
}


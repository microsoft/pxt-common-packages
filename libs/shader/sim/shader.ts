/// <reference path="../../screen/sim/image.ts" />

namespace pxsim.ShaderMethods {
    export function _mergeImage(dst: RefImage, src: RefImage, xy: number) {
        ImageMethods.typeCheck(dst);
        ImageMethods.typeCheck(src);
        mergeImage(dst, src, pxsim.ImageMethods.XX(xy), pxsim.ImageMethods.YY(xy));
    }

    function mergeImage(dst: RefImage, src: RefImage, x0: number, y0: number) {
        for (let x = 0; x < src._width; x++) {
            for (let y = 0; y < src._height; y++) {
                pxsim.ImageMethods.setPixel(
                    dst,
                    x0 + x,
                    y0 + y,
                    Math.min(pxsim.ImageMethods.getPixel(dst, x0 + x, y0 + y), pxsim.ImageMethods.getPixel(src, x, y))
                )
            }
        }
    }

    export function _mapImage(dst: RefImage, src: RefImage, xy: number, buf: RefBuffer) {
        ImageMethods.typeCheck(dst);
        ImageMethods.typeCheck(src);
        BufferMethods.typeCheck(buf);
        mapImage(dst, src, pxsim.ImageMethods.XX(xy), pxsim.ImageMethods.YY(xy), buf);
    }

    function mapImage(dst: RefImage, src: RefImage, x0: number, y0: number, buf: RefBuffer) {
        for (let x = 0; x < src._width; x++) {
            for (let y = 0; y < src._height; y++) {
                pxsim.ImageMethods.setPixel(
                    dst,
                    x0 + x,
                    y0 + y,
                    buf.data[pxsim.ImageMethods.getPixel(dst, x0 + x, y0 + y) + (pxsim.ImageMethods.getPixel(src, x, y) << 4)]
                )
            }
        }
    }
}
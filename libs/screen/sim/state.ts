namespace pxsim {
    export class ScreenState {
        width = 0
        height = 0
        canvas: HTMLCanvasElement
        flush: () => void
        screen: Uint32Array
        palette: Uint32Array
        lastImage: RefImage
        lastImageFlushTime = 0

        showImage(img: RefImage) {
            if (!this.flush) {
                this.width = img._width
                this.height = img._height
                this.canvas.width = this.width
                this.canvas.height = this.height

                const ctx = this.canvas.getContext("2d")
                ctx.imageSmoothingEnabled = false
                const imgdata = ctx.getImageData(0, 0, this.width, this.height)
                this.screen = new Uint32Array(imgdata.data.buffer)

                this.flush = () => {
                    ctx.putImageData(imgdata, 0, 0)
                }
            }

            const src = img.data
            const dst = this.screen
            if (this.width != img._width || this.height != img._height || src.length != dst.length)
                U.userError("wrong size")
            const p = this.palette
            for (let i = 0; i < src.length; ++i) {
                dst[i] = p[src[i] & 0xf]
            }
            this.flush()
            this.lastImage = img
            this.lastImageFlushTime = Date.now()
        }
    }

    export interface ScreenBoard extends CommonBoard {
        screenState: ScreenState;
    }

    export function getScreenState() {
        return (board() as ScreenBoard).screenState
    }
}
namespace pxsim.visuals {
    /**
     * Paints a screen state onto an SVG image element through a canvas. Each change to the state
     * copies the pixels into the canvas and schedules one repaint per animation frame. Returns a
     * function that undoes the binding.
     */
    export function bindScreenToSvgImage(state: ScreenState, lcd: SVGImageElement): () => void {
        const screenCanvas = document.createElement("canvas")
        const ctx = screenCanvas.getContext("2d")
        if (!ctx) return () => { }

        let imgdata: ImageData
        let arr: Uint32Array
        let frame = 0

        const flush = function () {
            frame = 0
            ctx.putImageData(imgdata, 0, 0)
            lcd.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", screenCanvas.toDataURL())
        }

        const previousOnChange = state.onChange
        const onChange = () => {
            if (!state.width || !state.height) return
            if (!imgdata || screenCanvas.width != state.width || screenCanvas.height != state.height) {
                screenCanvas.width = state.width
                screenCanvas.height = state.height
                ctx.imageSmoothingEnabled = false
                imgdata = ctx.getImageData(0, 0, state.width, state.height)
                arr = new Uint32Array(imgdata.data.buffer)
            }
            arr.set(state.screen)
            runtime.queueDisplayUpdate()
            if (!frame) frame = window.requestAnimationFrame(flush)
        }
        state.onChange = onChange

        return () => {
            if (frame) {
                window.cancelAnimationFrame(frame)
                frame = 0
            }
            if (state.onChange === onChange) state.onChange = previousOnChange
        }
    }
}

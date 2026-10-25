namespace pxsim.visuals {
    /**
     * Paints a screen state onto an SVG image through a canvas: the state's onChange copies the
     * pixels and schedules one repaint per animation frame.
     */
    export function bindScreenToSvgImage(state: ScreenState, lcd: SVGImageElement) {
        const screenCanvas = document.createElement("canvas");
        screenCanvas.width = state.width
        screenCanvas.height = state.height

        const ctx = screenCanvas.getContext("2d")
        ctx.imageSmoothingEnabled = false
        const imgdata = ctx.getImageData(0, 0, state.width, state.height)
        const arr = new Uint32Array(imgdata.data.buffer)

        const flush = function () {
            requested = false
            ctx.putImageData(imgdata, 0, 0)
            lcd.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", screenCanvas.toDataURL());
        }

        let requested = false;
        state.onChange = () => {
            arr.set(state.screen)
            // paint rect
            runtime.queueDisplayUpdate();
            if (!requested) {
                requested = true
                window.requestAnimationFrame(flush)
            }
        }
    }
}

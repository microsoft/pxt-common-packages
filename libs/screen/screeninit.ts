// This file would be usually overridden by the target.

let screen = image.create(178, 128)

namespace _screen_internal {
    //% shim=pxt::updateScreen
    function updateScreen(img: Image): void {}

    control.addFrameHandler(200, () => {
        updateScreen(screen)
    })

    updateScreen(screen)

    export function _stats(msg: string) {
        // show the msg somewhere - it contains frame rate etc
    }
}

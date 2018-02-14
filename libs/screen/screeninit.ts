// This file would be usually overridden by the target.

let screen = image.create(128, 128)

namespace _screen_internal {
    //% shim=pxt::updateScreen
    function updateScreen(img: Image): void {}

    control.addFrameHandler(200, () => {
        updateScreen(screen)
    })

    updateScreen(screen)
}

// This file would be usually overridden by the target.
const screen = image.create(178, 128)

namespace _screen_internal {
    //% shim=pxt::updateScreen
    function updateScreen(img: Image): void {}
    //% shim=pxt::updateStats
    function updateStats(msg: string): void {}

    control.setupScreenRefresh(() => updateScreen(screen))

    export function _stats(msg: string) {
        updateStats(msg)
    }
}

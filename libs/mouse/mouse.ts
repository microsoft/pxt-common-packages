/**
 * Mouse emulation
 */
//% icon="\uf245" color="#303030"
namespace mouse {
    /**
     * Generates a mouse click
     * @param button the button to click
     */
    //% help=mouse/click
    //% blockId=mouseClick block="mouse click button %index"
    //% weight=100
    export function click(button: MouseButton) {
        mouse.setButton(button, true)
        mouse.setButton(button, false)
    }
}
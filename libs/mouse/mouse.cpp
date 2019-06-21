// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDMouse.cpp

#include "pxt.h"

enum class MouseButton {
    //% block="right" enumval=1
    Right = 0x01,
    //% block="middle" enumval=4
    Middle = 0x04,
    //% block="left" enumval=2
    Left = 0x02
};

namespace mouse {
    /** 
    * Set the mouse button state to up or down
    */
    //% help=mouse/set-button
    //% blockId=mouseSetButton block="mouse button %index|%down=toggleDownUp"
    void setButton(MouseButton button, bool down) {
        if (down)
            pxt::mouse.buttonDown((codal::USBHIDMouseButton)button);
        else
            pxt::mouse.buttonUp((codal::USBHIDMouseButton)button);
    }

    /**
    * Move the mouse in the X and Y direction
    **/
    //% help=mouse/move
    //% blockId=mouseMove block="mouse move x %x|y %y"
    //% x.min=-128 x.max=127
    //% y.min=-128 y.max=127
    void move(int x, int y) {
        pxt::mouse.move(x, y);
    }

    /**
    * Turn the mouse wheel
    **/
    //% help=mouse/turn-wheel
    //% blockId=mouseWheel block="turn wheel %w"
    //% w.min=-128 w.max=127
    void turnWheel(int w) {
        pxt::mouse.moveWheel(w);
    }
}
// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDMouse.cpp

#include "pxt.h"

enum class MouseButton {
    //% block="right" enumval=1
    Right = 0x01,
    //% block="middle" enumval=2
    Middle = 0x02,
    //% block="left" enumval=4
    Left = 0x04
};

namespace mouse {
    /** 
    * Sets the mouse button state to down
    */
    //% help=mouse/set-button
    //% blockId=mouseSetButton block="mouse button %index=joystickStandardButton|%down"
    //% down.fieldEditor=toggleupdown down.fieldOptions.inverted=true
    void setButton(MouseButton button, bool down) {
        if (down)
            pxt::mouse.buttonDown((codal::USBHIDMouseButton)button);
        else
            pxt::mouse.buttonUp((codal::USBHIDMouseButton)button);
    }

    /**
    * Moves the mouse
    **/
    //% help=mouse/move
    //% blockId=mouseMove block="mouse move x %x|y %y"
    //% x.min=-128 x.max=127
    //% y.min=-128 y.max=127
    void move(int x, int y) {
        pxt::mouse.move(x, y);        
    }

    /**
    * Moves the mouse
    **/
    //% help=mouse/wheel
    //% blockId=mouseWheel block="turn wheel %w"
    //% w.min=-128 w.max=127
    void turnWheel(int w) {
        pxt::mouse.moveWheel(w);        
    }
}
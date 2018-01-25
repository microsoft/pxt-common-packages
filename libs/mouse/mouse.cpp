// https://github.com/lancaster-university/codal-core/blob/master/source/drivers/HIDMouse.cpp

#include "pxt.h"

enum class MouseButton {
    //% block="right"
    Right = 0x01,
    //% block="middle"
    Middle = 0x02,
    //% block="left"
    Left = 0x04
}

namespace mouse {
    /** 
    * Sets the mouse button state to down
    */
    //% help=mouse/set-button
    //% blockId=joystickSetButton block="mouse button %index=joystickStandardButton|%down"
    //% down.fieldEditor=toggleupdown
    void setButton(MouseButton button, bool down) {
        if (down)
            pxt::mouse.buttonDown(index);
        else
            pxt::mouse.buttonUp(index);
    }

    /**
    * Moves the mouse
    **/
    //% help=mouse/move
    //% blockId=mouseMove block="mouse move x %x|y %y"
    void move(int x, int y) {
        pxt::mouse.move(index, x, y);        
    }

    /**
    * Moves the mouse
    **/
    //% help=mouse/wheel
    //% blockId=mouseMove block="mouse wheel %w"
    void wheel(int w) {
        pxt::mouse.moveWheel(w);        
    }
}
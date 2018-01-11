// https://github.com/lancaster-university/codal-core/blob/master/inc/drivers/HIDJoystick.h

#include "pxt.h"
namespace joystick {
    /** 
    * Sets the button state to down
    */
    //% help=gamepad/set-button
    //% blockId=joystickSetButton block="set gamepad button %index|%down"
    //% index.min=0 index.max=127
    //% down.fieldEditor=toggleupdown
    //% 
    void setButton(int index, bool down) {
        if (down)
            pxt::joystick.buttonDown(index);
        else
            pxt::joystick.buttonUp(index);
    }

    /**
    * Sets the current move on the gamepad
    **/
    //% help=gamepad/move
    //% blockId=joystickMove block="gamepad move %index|x %x|y %y"
    //% index.min=0 index.max=1
    void move(int index, int x, int y) {
        pxt::joystick.move(index, x, y);        
    }

    /** 
    * Sets the throttle state
    */
    //% gamepad/set-throttle
    //% blockId=joystickSetThrottle block="set gamepad throttle %index|%value"
    //% index.min=0 index.max=31
    void setThrottle(int index, int value) {
        pxt::joystick.setThrottle(index, value);
    }
}
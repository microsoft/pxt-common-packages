// https://github.com/lancaster-university/codal-core/blob/master/inc/drivers/HIDJoystick.h



#include "pxt.h"
namespace gamepad {
    /** 
    * Set the button state to down
    */
    //% help=gamepad/set-button
    //% blockId=joystickSetButton block="gamepad button %index=joystickStandardButton|%down=toggleDownUp"
    //% weight=100
    void setButton(int index, bool down) {
        if (down)
            pxt::joystick.buttonDown(index);
        else
            pxt::joystick.buttonUp(index);
    }

    /**
    * Set the current move on the gamepad
    **/
    //% blockId=gamepadMove block="gamepad %index|move by x %x|y %y"
    //% help=gamepad/move
    //% index.min=0 index.max=1
    //% blockGap=8
    void move(int index, int x, int y) {
        pxt::joystick.move(index, x, y);        
    }

    /** 
    * Set the throttle state
    */
    //% blockId=gamepadSetThrottle block="gamepad set throttle %index|to %value"
    //% gamepad/set-throttle blockHidden=1
    //% index.min=0 index.max=1
    //% value.min=0 value.max=31
    //%help=gamepad/set-throttle
    void setThrottle(int index, int value) {
        value = max(0, min(31, value));
        pxt::joystick.setThrottle(index, value);
    }
}
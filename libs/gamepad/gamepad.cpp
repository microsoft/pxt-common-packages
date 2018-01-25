// https://github.com/lancaster-university/codal-core/blob/master/inc/drivers/HIDJoystick.h



#include "pxt.h"
namespace gamepad {
    /** 
    * Sets the button state to down
    */
    //% help=gamepad/set-button
    //% blockId=joystickSetButton block="gamepad button %index=joystickStandardButton|%down"
    //% index.min=0 index.max=127
    //% down.fieldEditor=toggleupdown
    void setButton(int index, bool down) {
        if (down)
            pxt::joystick.buttonDown(index);
        else
            pxt::joystick.buttonUp(index);
    }

    /**
    * Sets the current move on the gamepad
    **/
    //% help=gamepad/move blockHidden=1
    //% blockId=joystickMove block="gamepad move stick %index|to x %x|y %y"
    //% index.min=0 index.max=1
    void move(int index, int x, int y) {
        pxt::joystick.move(index, x, y);        
    }

    /** 
    * Sets the throttle state
    */
    //% gamepad/set-throttle blockHidden=1
    //% blockId=joystickSetThrottle block="set gamepad throttle %index|to %value"
    //% index.min=0 index.max=1
    //% value.min=0 value.max=31
    void setThrottle(int index, int value) {
        value = max(0, min(31, value));
        pxt::joystick.setThrottle(index, value);
    }
}
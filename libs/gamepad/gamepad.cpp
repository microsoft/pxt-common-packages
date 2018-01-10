// https://github.com/lancaster-university/codal-core/blob/master/inc/drivers/HIDJoystick.h

#include "pxt.h"
#include "HIDJoystick.h"

namespace pxt {
 
class WJoystick {
  public:
    USBHIDJoystick gamepad;
  public:
    WJoystick() 
        : gamepad() 
    { 
    }
};
SINGLETON(WJoystick);

}

namespace gamepad {
    /** 
    * Sets the button state to down
    */
    //% help=gamepad/set-button
    //% blockId=joystickSetButton block="set gamepad button %index|%down"
    //% index.min=0 index.max=127
    //% down.fieldEditor=toggleupdown
    void setButton(int index, bool down) {
        auto pJoystick = getWJoystick();
        if (down)
            pJoystick->gamepad.buttonDown(index);
        else
            pJoystick->gamepad.buttonUp(index);
    }

    /**
    * Sets the current move on the gamepad
    **/
    //% help=gamepad/move
    //% blockId=joystickMove block="gamepad move %index|x %x|y %y"
    //% index.min=0 index.max=1
    void move(int index, int x, int y) {
        auto pJoystick = getWJoystick();
        pJoystick->gamepad.move(index, x, y);        
    }

    /** 
    * Sets the throttle state
    */
    //% gamepad/set-throttle
    //% blockId=joystickSetThrottle block="set gamepad throttle %index|%value"
    //% index.min=0 index.max=1
    void setThrottle(int index, int value) {
        auto pJoystick = getWJoystick();
        pJoystick->gamepad.setThrottle(index, value);
    }
}
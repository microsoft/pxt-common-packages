// https://github.com/lancaster-university/codal-core/blob/master/inc/drivers/HIDJoystick.h

#include "pxt.h"
#include "HIDJoystick.h"

namespace pxt {
 
class WJoystick {
  public:
    USBHIDJoystick joystick;
  public:
    WJoystick() 
        : joystick() 
    { 
    }
};
SINGLETON(WJoystick);

}

namespace gamepad {
    /** 
    * Sets the button state to down
    */
    //% block=joystickSetButton block="set button %index|%down"
    //% index.min=0 index.max=127
    //% down.fieldeditor=toggleupdown
    void setButton(int index, bool down) {
        const pJoystick = getWJoystick();
        if (down)
            pJoystick->joystick.buttonDown(index);
        else
            pJoystick->joystick.buttonUp(index);
    }

    /**
    * Sets the current move on the gamepad
    **/
    //% block=joystickMove block="move %index|x %x|y %y"
    //% index.min=0 index.max=1
    void move(int index, int x, int y) {
        const pJoystick = getWJoystick();
        pJoystick->move(index, x, y);        
    }

    /** 
    * Sets the throttle state
    */
    //% block=joystickSetThrottle block="set throttle %index|%value"
    //% index.min=0 index.max=1
    void setThrottle(int index, int value) {
        const pJoystick = getWJoystick();
        pJoystick->setThrottle(index, value);
    }
}
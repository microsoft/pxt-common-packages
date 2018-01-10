// https://github.com/lancaster-university/codal-core/blob/master/inc/drivers/HIDJoystick.h

#include "pxt.h"
#include "HIDJoystick.h"

namespace pxt {
 
class WJoystick {
  private:
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

    }
}
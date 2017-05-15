#include "pxt.h"
#include "DeviceButton.h"
#include "pins.h"

enum class SwitchDirection {
    //% block="left"
    Left = DEVICE_BUTTON_EVT_UP,
    //% block="right"
    Right = DEVICE_BUTTON_EVT_DOWN
};

namespace pxt {

// Wrapper classes
class WSwitch {
  public:
    DeviceButton slideSwitch;

    WSwitch()
        : slideSwitch(*pxt::lookupPin(PIN_BTN_SLIDE), DEVICE_ID_BUTTON_SLIDE,
                      DEVICE_BUTTON_SIMPLE_EVENTS, ACTIVE_LOW, PullUp) {}
};
SINGLETON(WSwitch);

}

namespace input {
/**
* Do something when the slide switch is moved left or right.
*
* @param direction the direction the switch must be moved to trigget the event
*/
//% help=input/on-switch-moved weight=93
//% blockId=device_on_switch_moved block="on switch moved %direction" blockGap=8
//% parts="switch"
void onSwitchMoved(SwitchDirection direction, Action handler) {
    auto slide = getWSwitch();
    registerWithDal(slide->slideSwitch.id, (int)direction, handler);

    // trigger event if the switch position matches the handler direction
    auto currentDirection = slide->slideSwitch.isPressed() ? SwitchDirection::Right : SwitchDirection::Left;
    if (direction == currentDirection)
        DeviceEvent ev(slide->slideSwitch.id, (int)direction);
}
}
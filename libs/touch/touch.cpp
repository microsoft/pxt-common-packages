#include "pxt.h"
#include "touch.h"

namespace pxt {
    
// TODO this is CPX-specific; elsewhere I think we want something hanging off the PwmPin
static const int8_t touchPins[] = {
    5, 6, 7, 35, 34, 41, 40
};

class WTouch {
  public:

    TouchButton buttons[0];
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getTouchButton
    /**
    * Capacitive pin A1
    */
    //% block="pin A1"
    TouchButton pinA1;
    /**
    * Capacitive pin A2
    */
    //% block="pin A2"
    TouchButton pinA2;
    /**
    * Capacitive pin A3
    */
    //% block="pin A3"
    TouchButton pinA3;
    /**
    * Capacitive pin A4
    */
    //% block="pin A4"
    TouchButton pinA4;
    /**
    * Capacitive pin A5
    */
    //% block="pin A5"
    TouchButton pinA5;
    /**
    * Capacitive pin A6
    */
    //% block="pin A6"
    TouchButton pinA6;
    /**
    * Capacitive pin A7
    */
    //% block="pin A7"
    TouchButton pinA7;

    WTouch() {
        memclr(buttons, sizeof(touchPins));
    }
};
SINGLETON(WTouch);
const int LastTouchButtonID = &((WTouch *)0)->pinA7 - ((WTouch *)0)->buttons;

//%
CapTouchButton *getTouchButton(int id) {
    if (!(0 <= id && id <= LastTouchButtonID))
        target_panic(42);
    if (sizeof(touchPins) / sizeof(touchPins[0]) != LastTouchButtonID + 1)
        target_panic(42);
    auto w = getWTouch();
    if (!w->buttons[id])
        w->buttons[id] = new CapTouchButton(*pxt::lookupPin(touchPins[id]));
    return w->buttons[id];
}
}


namespace TouchButtonMethods {

/**
 * Manually define the threshold use to detect a touch event. Any sensed value equal to or greater than this value will be interpreted as a touch.
 * @param name button name
 * @param threshold minimum value to consider a touch eg:200
 */
//% blockId=touch_set_threshold block="button %button|set threshold %threshold"
//% blockNamespace=input
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
//% group="More" weight=16 blockGap=8
void setThreshold(TouchButton button, int threshold) {
    button->setThreshold(max(0, min(1023, threshold)));
}

/**
 * Reads the current value registered with the button.
 * @param name button name
 */
//% blockId=touch_value block="button %button|value"
//% blockNamespace=input
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
//% group="More" weight=49 blockGap=8
int value(TouchButton button) {
    return button->getValue();
}

}
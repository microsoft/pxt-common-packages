#include "pxt.h"

namespace pxt {

static const int touchPins[] = {
    PIN_A1, PIN_A2, PIN_A3, PIN_A4, PIN_A5, PIN_A6, PIN_A7
};

class WTouch {
  public:

#define Button CapTouchButton *
    Button buttons[0];
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getTouchButton
    /**
    * Capacitive pin A1
    */
    //% block="pin A1"
    Button pinA1;
    /**
    * Capacitive pin A2
    */
    //% block="pin A2"
    Button pinA2;
    /**
    * Capacitive pin A3
    */
    //% block="pin A3"
    Button pinA3;
    /**
    * Capacitive pin A4
    */
    //% block="pin A4"
    Button pinA4;
    /**
    * Capacitive pin A5
    */
    //% block="pin A5"
    Button pinA5;
    /**
    * Capacitive pin A6
    */
    //% block="pin A6"
    Button pinA6;
    /**
    * Capacitive pin A7
    */
    //% block="pin A7"
    Button pinA7;
#undef Button

    WTouch() {
        memclr(buttons, sizeof(touchPins));
    }
};
SINGLETON(WTouch);
const int LastTouchButtonID = &((WTouch *)0)->pinA7 - ((WTouch *)0)->buttons;

//%
CapTouchButton *getTouchButton(int id) {
    if (!(0 <= id && id <= LastTouchButtonID))
        device.panic(42);
    if (sizeof(touchPins) / sizeof(touchPins[0]) != LastTouchButtonID + 1)
        device.panic(42);
    auto w = getWTouch();
    if (!w->buttons[id])
        w->buttons[id] = new CapTouchButton(*pxt::lookupPin(touchPins[id]));
    return w->buttons[id];
}
}

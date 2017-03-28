#include "pxt.h"
#include "DeviceSystemTimer.h"
#include "AnalogSensor.h"
#include "MultiButton.h"

namespace pxt {

// Wrapper classes

class WButtons {
  public:
#define Button DeviceButton
    Button buttons[0];
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getButton
    /**
     * Left button.
     */
    //% block="left button" weight=95
    Button leftButton;
    /**
     * Right button.
     */
    //% block="right button" weight=94
    Button rightButton;
#undef Button
// MultiButton has to be last, as it has different size
#define Button MultiButton
    /**
     * Left and Right button.
     */
    //% block="left+right buttons" weight=93
    Button leftAndRightButtons;
#undef Button

    WButtons()
        : leftButton(*pxt::lookupPin(PIN_BTN_LEFT), DEVICE_ID_BUTTON_A, DEVICE_BUTTON_ALL_EVENTS,
                     ACTIVE_HIGH, PullDown),
          rightButton(*pxt::lookupPin(PIN_BTN_RIGHT), DEVICE_ID_BUTTON_B, DEVICE_BUTTON_ALL_EVENTS,
                      ACTIVE_HIGH, PullDown),
          leftAndRightButtons(PIN_BTN_LEFT, PIN_BTN_RIGHT, DEVICE_ID_BUTTON_AB) {}
};
SINGLETON(WButtons);

const int LastButtonID = (DeviceButton*)&((WButtons *)0)->leftAndRightButtons - ((WButtons *)0)->buttons;

//%
DeviceButton *getButton(int id) {
    if (!(0 <= id && id <= LastButtonID))
        device.panic(42);
    return &getWButtons()->buttons[id];
}

static const int touchPins[] = {
    PIN_A4, PIN_A5, PIN_A6, PIN_A7, PIN_A8, PIN_A9, PIN_A10, PIN_A11,
};


class WTouch {
  public:
    DevicePin touchDrive;
    TouchSensor touchSensor;

#define Button TouchButton *
    Button buttons[0];
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getTouchButton
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
    /**
    * Capacitive pin A8
    */
    //% block="pin A8"
    Button pinA8;
    /**
    * Capacitive pin A9
    */
    //% block="pin A9"
    Button pinA9;
    /**
    * Capacitive pin A10
    */
    //% block="pin A10"
    Button pinA10;
    /**
    * Capacitive pin A11
    */
    //% block="pin A11"
    Button pinA11;
#undef Button

    WTouch() : INIT_PIN(touchDrive, PIN_CAPSENSE), touchSensor(touchDrive) {
        memclr(buttons, sizeof(touchPins));
    }
};
SINGLETON(WTouch);
const int LastTouchButtonID = &((WTouch *)0)->pinA11 - ((WTouch *)0)->buttons;

//%
TouchButton *getTouchButton(int id) {
    if (!(0 <= id && id <= LastTouchButtonID))
        device.panic(42);
    if (sizeof(touchPins) / sizeof(touchPins[0]) != LastTouchButtonID + 1)
        device.panic(42);
    auto w = getWTouch();
    if (!w->buttons[id])
        w->buttons[id] = new TouchButton(*pxt::lookupPin(touchPins[id]), w->touchSensor);
    return w->buttons[id];
}
}

//% noRefCounting fixedInstances
namespace ButtonMethods {
/**
 * Do something when a button (``A``, ``B`` or both ``A+B``) is clicked, double clicked, etc...
 * @param button the button that needs to be clicked or used
 * @param event the kind of button gesture that needs to be detected
 * @param body code to run when the event is raised
 */
//% help=input/on-button-event weight=99 blockGap=8
//% blockId=buttonEvent block="on %button|%event"
//% parts="buttonpair"
//% blockNamespace=input
//% blockGap=8
void onEvent(Button button, ButtonEvent ev, Action body) {
    registerWithDal(button->id, (int)ev, body);
}

/**
 * Get the button state (pressed or not).
 * @param button the button to query the request
 */
//% help=input/button-is-pressed weight=79
//% block="%NAME|is pressed"
//% blockId=buttonIsPressed
//% blockGap=8
//% parts="buttonpair"
//% blockNamespace=input
bool isPressed(Button button) {
    return button->isPressed();
}

/**
 * Indicates if the button was pressed since this function was last called.
 * @param button the button to query the request
 */
//% help=input/button-was-pressed weight=78
//% block="%NAME|was pressed"
//% blockId=buttonWasPressed
//% parts="buttonpair"
//% blockNamespace=input
bool wasPressed(Button button) {
    return button->wasPressed();
}
}

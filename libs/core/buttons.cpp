#include "pxt.h"
#include "DeviceSystemTimer.h"
#include "AnalogSensor.h"
#include "MultiButton.h"

namespace pxt {

class WButtons {
  public:
#define Button DeviceButton
    Button buttons[0];
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getButton
    /**
     * Left button.
     */
    //% block="button A" weight=95
    Button buttonA;
    /**
     * Right button.
     */
    //% block="button B" weight=94
    Button buttonB;
#undef Button
// MultiButton has to be last, as it has different size
#define Button MultiButton
    /**
     * Left and Right button.
     */
    //% block="buttons A+B" weight=93
    Button buttonsAB;
#undef Button

    WButtons()
        : buttonA(*pxt::lookupPin(PIN_BTN_A), DEVICE_ID_BUTTON_A, DEVICE_BUTTON_ALL_EVENTS,
                     ACTIVE_HIGH, PullDown),
          buttonB(*pxt::lookupPin(PIN_BTN_B), DEVICE_ID_BUTTON_B, DEVICE_BUTTON_ALL_EVENTS,
                      ACTIVE_HIGH, PullDown),
          buttonsAB(PIN_BTN_A, PIN_BTN_B, DEVICE_ID_BUTTON_AB) {}
};
SINGLETON(WButtons);

const int LastButtonID = (DeviceButton*)&((WButtons *)0)->buttonsAB - ((WButtons *)0)->buttons;

//%
DeviceButton *getButton(int id) {
    if (!(0 <= id && id <= LastButtonID))
        device.panic(42);
    return &getWButtons()->buttons[id];
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
//% button.fieldEditor="gridpicker"
//% button.fieldOptions.width=220
//% button.fieldOptions.columns=3
void onEvent(Button button, ButtonEvent ev, Action body) {
    registerWithDal(button->id, (int)ev, body);
}

/**
 * Get the button state (pressed or not).
 * @param button the button to query the request
 */
//% help=input/is-pressed weight=79
//% block="%NAME|is pressed"
//% blockId=buttonIsPressed
//% blockGap=8
//% parts="buttonpair"
//% blockNamespace=input
//% button.fieldEditor="gridpicker"
//% button.fieldOptions.width=220
//% button.fieldOptions.columns=3
bool isPressed(Button button) {
    return button->isPressed();
}

/**
 * Indicates if the button was pressed since this function was last called.
 * @param button the button to query the request
 */
//% help=input/was-pressed weight=78
//% block="%NAME|was pressed"
//% blockId=buttonWasPressed
//% parts="buttonpair" blockGap=8
//% blockNamespace=input advanced=true
//% button.fieldEditor="gridpicker"
//% button.fieldOptions.width=220
//% button.fieldOptions.columns=3
bool wasPressed(Button button) {
    return button->wasPressed();
}
}

#include "pxt.h"

enum class TouchTargetMode {
    //% block="resistive"
    Resistive = 0,
    //% block="capacitative"
    Capacitative = 1
};

enum class TouchTarget {
    //% block="P0"
    P0 = MICROBIT_ID_IO_P0,
    //% block="P1"
    P1 = MICROBIT_ID_IO_P1,
    //% block="P2"
    P2 = MICROBIT_ID_IO_P2,
    //% block="logo"
    LOGO = MICROBIT_ID_LOGO
};

namespace pins {

/**
* Configure the touch detection for the pins and logo.
* P0, P1, P2 use resistive touch by default.
* The logo uses capacitative touch by default.
* @param name target to change the touch mode for, eg: TouchTarget.P0
* @param mode the touch mode to use, eg: TouchTargetMode.Capacitative
*/
//% weight=60
//% blockId=device_touch_set_type block="set %name to touch mode %mode"
//% group="micro:bit v2"
//% advanced=true
void touchSetMode(TouchTarget name, TouchTargetMode mode) {
#if MICROBIT_CODAL
    const auto pin = name == TouchTarget::LOGO ? &uBit.io.logo : getPin((int)name);
    if (pin) {
        pin->isTouched(mode == TouchTargetMode::Capacitative ? TouchMode::Capacitative : TouchMode::Resistive);
    }
#else
    target_panic(PANIC_VARIANT_NOT_SUPPORTED);
#endif
}

}
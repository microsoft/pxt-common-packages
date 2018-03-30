#include "pxt.h"

namespace AnalogInPinMethods {

/**
 * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
 * @param name pin to write to
 */
//% help=pins/analog-read weight=53
//% blockId=device_get_analog_pin block="analog read|pin %name" blockGap="8"
//% blockNamespace=pins
//% parts="photocell" trackArgs=0
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
int analogRead(AnalogInPin name) {
    return PINOP(getAnalogValue());
}
}

namespace AnalogOutPinMethods {
void analogWrite(AnalogPin name, int value) __attribute__ ((weak));

/**
 * Set the connector value as analog. Value must be comprised between 0 and 1023.
 * @param name pin name to write to
 * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
 */
//% help=pins/analog-write weight=52
//% blockId=device_set_analog_pin block="analog write|pin %name|to %value" blockGap=8
//% blockNamespace=pins
//% parts="analogled" trackArgs=0
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void analogWrite(AnalogOutPin name, int value) {
    PINOP(setAnalogValue(value));
}
}
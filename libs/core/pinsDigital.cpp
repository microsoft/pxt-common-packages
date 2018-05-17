#include "pxt.h"

enum class PulseValue {
    //% block=high
    High = DEVICE_PIN_EVT_PULSE_HI,
    //% block=low
    Low = DEVICE_PIN_EVT_PULSE_LO
};

enum class PinEvent {
    //% block="pulse high"
    PulseHigh = DEVICE_PIN_EVT_PULSE_HI,
    //% block="pulse low"
    PulseLow = DEVICE_PIN_EVT_PULSE_LO,
    //% block="rise"
    Rise = DEVICE_PIN_EVT_RISE,
    //% block="fall"
    Fall = DEVICE_PIN_EVT_FALL,
};

enum class PinPullMode {
    //% block="down"
    PullDown = 0,
    //% block="up"
    PullUp = 1,
    //% block="none"
    PullNone = 2
};

namespace DigitalPinMethods {
/**
 * Read a pin or connector as either 0 or 1
 * @param name pin to read from
 */
//% help=pins/digital-read weight=61
//% blockId=device_get_digital_pin block="digital read|pin %name" blockGap=8
//% parts="slideswitch" trackArgs=0
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
bool digitalRead(DigitalPin name) {
    return PINOP(getDigitalValue()) != 0;
}

/**
     * Set a pin or connector value to either 0 or 1.
    * @param name pin to write to
    * @param value value to set on the pin
    */
//% help=pins/digital-write weight=60
//% blockId=device_set_digital_pin block="digital write|pin %name|to %value=toggleHighLow"
//% parts="led" trackArgs=0
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void digitalWrite(DigitalPin name, bool value) {
    PINOP(setDigitalValue(value));
}

/**
* Make this pin a digital input, and create events where the timestamp is the duration
* that this pin was either ``high`` or ``low``.
*/
//% help=pins/on-pulsed weight=16 blockGap=8
//% blockId=pins_on_pulsed block="on|pin %pin|pulsed %pulse"
//% blockNamespace=pins
//% pin.fieldEditor="gridpicker"
//% pin.fieldOptions.width=220
//% pin.fieldOptions.columns=4
//% parts="slideswitch" trackArgs=0
//% deprecated=1 hidden=1
void onPulsed(DigitalPin pin, PulseValue pulse, Action body) {
    pin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
    registerWithDal(pin->id, (int)pulse, body);
}

/**
* Register code to run when a pin event occurs. 
*/
//% help=pins/on-event weight=16 blockGap=8
//% blockId=pinsonevent block="on|pin %pin|%event"
//% blockNamespace=pins
//% pin.fieldEditor="gridpicker"
//% pin.fieldOptions.width=220
//% pin.fieldOptions.columns=4
//% parts="slideswitch" trackArgs=0
void onEvent(DigitalPin pin, PinEvent event, Action body) {
    switch(event) {
        case PinEvent::PulseHigh:
        case PinEvent::PulseLow:
            pin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
            registerWithDal(pin->id, (int)event, body);
            break;
        case PinEvent::Rise:
        case PinEvent::Fall:
            pin->eventOn(DEVICE_PIN_EVENT_ON_EDGE);
            registerWithDal(pin->id, (int)event, body);
            break;    
    }    
}

/**
* Return the duration of a pulse in microseconds
* @param name the pin which measures the pulse
* @param value the value of the pulse (default high)
* @param maximum duration in micro-seconds
*/
//% blockId="pins_pulse_in" block="pulse in (µs)|pin %name|pulsed %high||timeout %maxDuration (us)"
//% weight=18 blockGap=8
//% help="pins/pulse-in"
//% blockNamespace=pins
//% pin.fieldEditor="gridpicker"
//% pin.fieldOptions.width=220
//% pin.fieldOptions.columns=4
int pulseIn(DigitalPin pin, PulseValue value, int maxDuration = 2000000) {
    int pulse = PulseValue::High == value ? 1 : 0;
    uint64_t tick = system_timer_current_time_us();
    uint64_t maxd = (uint64_t)maxDuration;
    while (pin->getDigitalValue() != pulse) {
        if (system_timer_current_time_us() - tick > maxd)
            return 0;
    }

    uint64_t start = system_timer_current_time_us();
    while (pin->getDigitalValue() == pulse) {
        if (system_timer_current_time_us() - tick > maxd)
            return 0;
    }
    uint64_t end = system_timer_current_time_us();
    return end - start;
}

/**
* Set the pull direction of this pin.
* @param name pin to set the pull mode on
* @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
*/
//% help=pins/set-pull weight=17 blockGap=8
//% blockId=device_set_pull block="set pull|pin %pin|to %pull"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void setPull(DigitalPin name, PinPullMode pull) {
    PullMode m = pull == PinPullMode::PullDown ? PullMode::Down : pull == PinPullMode::PullUp
                                                                        ? PullMode::Up
                                                                        : PullMode::None;
    PINOP(setPull(m));
}

}
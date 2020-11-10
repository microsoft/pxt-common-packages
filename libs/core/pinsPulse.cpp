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

namespace DigitalInOutPinMethods {
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
void onPulsed(DigitalInOutPin pin, PulseValue pulse, Action body) {
    pin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
    registerWithDal(pin->id, (int)pulse, body);
}

/**
* Register code to run when a pin event occurs. 
*/
//% help=pins/on-event weight=20 blockGap=8
//% blockId=pinsonevent block="on|pin %pin|%event"
//% blockNamespace=pins
//% pin.fieldEditor="gridpicker"
//% pin.fieldOptions.width=220
//% pin.fieldOptions.columns=4
//% parts="slideswitch" trackArgs=0
void onEvent(DigitalInOutPin pin, PinEvent event, Action body) {
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
//% blockId="pins_pulse_in" block="pulse in (µs)|pin %name|pulsed %high||timeout %maxDuration (µs)"
//% weight=18 blockGap=8
//% help="pins/pulse-in"
//% blockNamespace=pins
//% pin.fieldEditor="gridpicker"
//% pin.fieldOptions.width=220
//% pin.fieldOptions.columns=4
int pulseIn(DigitalInOutPin pin, PulseValue value, int maxDuration = 2000000) {
#if MICROBIT_CODAL
    PulseIn *p = new PulseIn(pin);
    int period = p->awaitPulse(maxDuration);
    delete p;
    return period;
#else    
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
#endif
}

}


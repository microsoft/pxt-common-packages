// this type alias is required for backward compatibility
// it gets overriden in microbit (DigitalPin is an enum over there)
enum DigitalPin {
    P0 = DAL.CFG_PIN_P0,
    P1 = DAL.CFG_PIN_P1,
    P2 = DAL.CFG_PIN_P2,
    P3 = DAL.CFG_PIN_P3,
    P4 = DAL.CFG_PIN_P4,
    P5 = DAL.CFG_PIN_P5,
    P6 = DAL.CFG_PIN_P6,
    P7 = DAL.CFG_PIN_P7,
    P8 = DAL.CFG_PIN_P8,
    P9 = DAL.CFG_PIN_P9,
    P10 = DAL.CFG_PIN_P10,
    P11 = DAL.CFG_PIN_P11,
    P12 = DAL.CFG_PIN_P12,
    P13 = DAL.CFG_PIN_P13,
    P14 = DAL.CFG_PIN_P14,
    P15 = DAL.CFG_PIN_P15,
    P16 = DAL.CFG_PIN_P16,
    P19 = DAL.CFG_PIN_P19,
    P20 = DAL.CFG_PIN_P20
}

enum AnalogPin {
    P0 = DAL.CFG_PIN_P0,
    P1 = DAL.CFG_PIN_P1,
    P2 = DAL.CFG_PIN_P2,
    P3 = DAL.CFG_PIN_P3,
    P4 = DAL.CFG_PIN_P4,
    P10 = DAL.CFG_PIN_P10,
    P5 = DAL.CFG_PIN_P5,
    P6 = DAL.CFG_PIN_P6,
    P7 = DAL.CFG_PIN_P7,
    P8 = DAL.CFG_PIN_P8,
    P9 = DAL.CFG_PIN_P9,
    P11 = DAL.CFG_PIN_P11,
    P12 = DAL.CFG_PIN_P12,
    P13 = DAL.CFG_PIN_P13,
    P14 = DAL.CFG_PIN_P14,
    P15 = DAL.CFG_PIN_P15,
    P16 = DAL.CFG_PIN_P16,
    P19 = DAL.CFG_PIN_P19,
    P20 = DAL.CFG_PIN_P20
}

namespace pins {
    /**
     * Sets the pin pull
     * @param pin 
     * @param mode 
     */
    //% deprecated=1
    export function setPull(pin: DigitalPin, mode: PinPullMode) {
        const p = pins.pinByCfg(pin);
        if (p)
            p.setPull(mode);
    }

    /**
     * Sets the digital pin status
     * @param pin
     * @param value 
     */
    //% deprecated=1
    export function digitalWritePin(pin: DigitalPin, value: number) {
        const p = pins.pinByCfg(pin);
        if (p)
            p.digitalWrite(!!value);
    }

    /**
     * Reads the pin status
     * @param pin 
     */
    //% deprecated=1
    export function digitalReadPin(pin: DigitalPin): number {
        const p = pins.pinByCfg(pin);
        return p && p.digitalRead() ? 1 : 0;
    }

    /**
     * Sets the digital pin status
     * @param pin 
     * @param value 
     */
    //% deprecated=1
    export function analogWritePin(pin: AnalogPin, value: number) {
        const p = pins.pinByCfg(pin) as AnalogOutPin;
        if (p)
            p.analogWrite(value);
    }

    /**
     * Reads the pin status
     * @param pin 
     */
    //% deprecated=1
    export function analogReadPin(pin: AnalogPin): number {
        const p = pins.pinByCfg(pin) as AnalogInPin;
        if (p)
            return p.analogRead();
        else 
            return 0;
    }

    /**
    * Make this pin a digital input, and create events where the timestamp is the duration
    * that this pin was either ``high`` or ``low``.
    */
    //% deprecated=1
    export function onPulsed(pin: DigitalPin, pulse: PulseValue, body: () => void): void {
        const p = pins.pinByCfg(pin);
        if (p)
            p.onPulsed(pulse, body);
    }

    /**
    * Register code to run when a pin event occurs. 
    */
    //% deprecated=1
    export function onEvent(pin: DigitalPin, event: PinEvent, body: () => void): void {
        const p = pins.pinByCfg(pin);
        if (p)
            p.onEvent(event, body);
    }

    /**
    * Return the duration of a pulse in microseconds
    * @param name the pin which measures the pulse
    * @param value the value of the pulse (default high)
    * @param maximum duration in micro-seconds
    */
    //% deprecated=1
    export function pulseIn(pin: DigitalPin, value: PulseValue, maxDuration?: number): number {
        const p = pins.pinByCfg(pin);
        if (p)
            return p.pulseIn(value, maxDuration);
        else 
            return 0;
    }

    export function map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
        return Math.map(value, fromLow, fromHigh, toLow, toHigh);
    }
}
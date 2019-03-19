// this type alias is required for backward compatibility
// it gets overriden in microbit (DigitalPin is an enum over there)
type DigitalPin = DigitalInOutPin;
type AnalogPin = AnalogInOutPin;

namespace pins {
    /**
     * Sets the pin pull
     * @param pin 
     * @param mode 
     */
    //% deprecated=1
    export function setPull(pin: DigitalPin, mode: PinPullMode) {
        pin.setPull(mode);
    }

    /**
     * Sets the digital pin status
     * @param pin
     * @param value 
     */
    //% deprecated=1
    export function digitalWritePin(pin: DigitalPin, value: number) {
        pin.digitalWrite(!!value);
    }

    /**
     * Reads the pin status
     * @param pin 
     */
    //% deprecated=1
    export function digitalReadPin(pin: DigitalPin): number {
        return pin.digitalRead() ? 1 : 0;
    }

    /**
     * Sets the digital pin status
     * @param pin 
     * @param value 
     */
    //% deprecated=1
    export function analogWritePin(pin: AnalogOutPin, value: number) {
        pin.analogWrite(value);
    }

    /**
     * Reads the pin status
     * @param pin 
     */
    //% deprecated=1
    export function analogReadPin(pin: AnalogInPin): number {
        return pin.analogRead();
    }

    /**
    * Make this pin a digital input, and create events where the timestamp is the duration
    * that this pin was either ``high`` or ``low``.
    */
    //% deprecated=1
    export function onPulsed(pin: DigitalPin, pulse: PulseValue, body: () => void): void {
        pin.onPulsed(pulse, body);
    }

    /**
    * Register code to run when a pin event occurs. 
    */
    //% deprecated=1
    export function onEvent(pin: DigitalPin, event: PinEvent, body: () => void): void {
        pin.onEvent(event, body);
    }

    /**
    * Return the duration of a pulse in microseconds
    * @param name the pin which measures the pulse
    * @param value the value of the pulse (default high)
    * @param maximum duration in micro-seconds
    */
    //% deprecated=1
    export function pulseIn(pin: DigitalPin, value: PulseValue, maxDuration?: number): number {
        return pin.pulseIn(value, maxDuration);
    }

    export function map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
        return Math.map(value, fromLow, fromHigh, toLow, toHigh);
    }
}
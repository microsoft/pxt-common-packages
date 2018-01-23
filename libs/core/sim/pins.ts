
namespace pxsim.pins {
    export class CommonPin extends Pin {
        used: boolean;
    }

    export class DigitalPin extends CommonPin {
    }

    export class AnalogPin extends CommonPin {

    }

    export class PwmOnlyPin extends CommonPin {

    }

    export class PwmPin extends CommonPin {

    }

    export function markUsed(name: CommonPin) {
        if (!name.used) {
            name.used = true;
            runtime.queueDisplayUpdate();
        }
    }
}

namespace pxsim.DigitalPinMethods {
    export function digitalRead(name: pins.DigitalPin): number {
        return name.digitalReadPin();
    }

    /**
    * Set a pin or connector value to either 0 or 1.
    * @param value value to set on the pin, 1 eg,0
    */
    export function digitalWrite(name: pins.DigitalPin, value: number): void {
        name.digitalWritePin(value);
    }

    /**
    * Configures this pin to a digital input, and generates events where the timestamp is the duration
    * that this pin was either ``high`` or ``low``.
    */
    export function onPulsed(name: pins.DigitalPin, pulse: number, body: RefAction): void {
        // NOP, can't simulate
    }

    /**
    * Returns the duration of a pulse in microseconds
    * @param value the value of the pulse (default high)
    * @param maximum duration in micro-seconds
    */
    export function pulseIn(name: pins.DigitalPin, pulse: number, maxDuration = 2000000): number {
        // Always return default value, can't simulate
        return 500;
    }

    /**
    * Configures the pull of this pin.
    * @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
    */
    export function setPull(name: pins.DigitalPin, pull: number): void {
        name.setPull(pull);
    }

    /**
    * Do something when a pin is pressed.
    * @param body the code to run when the pin is pressed
    */
    export function onPressed(name: pins.DigitalPin, body: RefAction): void {
    }

    /**
     * Do something when a pin is released.
     * @param body the code to run when the pin is released
     */
    export function onReleased(name: pins.DigitalPin, body: RefAction): void {
    }

    /**
     * Get the pin state (pressed or not). Requires to hold the ground to close the circuit.
     * @param name pin used to detect the touch
     */
    export function isPressed(name: pins.DigitalPin): boolean {
        return name.isTouched();
    }
}

namespace pxsim.AnalogPinMethods {
    /**
     * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
     */
    export function analogRead(name: pins.AnalogPin): number {
        pins.markUsed(name);
        return name.analogReadPin();
    }

    /**
     * Set the connector value as analog. Value must be comprised between 0 and 1023.
     * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
     */
    export function analogWrite(name: pins.AnalogPin, value: number): void {
        pins.markUsed(name);
        name.analogWritePin(value);

    }

    /**
     * Configures the Pulse-width modulation (PWM) of the analog output to the given value in
     * **microseconds** or `1/1000` milliseconds.
     * If this pin is not configured as an analog output (using `analog write pin`), the operation has
     * no effect.
     * @param micros period in micro seconds. eg:20000
     */
    export function analogSetPeriod(name: pins.AnalogPin, micros: number): void {
        pins.markUsed(name);
        name.analogSetPeriod(micros);
    }
}

namespace pxsim.PwmOutPinMethods {
    export function analogSetPeriod(name: pins.PwmOnlyPin, micros: number): void {
        name.analogSetPeriod(micros);
    }

    export function servoWrite(name: pins.PwmOnlyPin, value: number): void {
        name.servoWritePin(value);
    }

    export function servoSetPulse(name: pins.PwmOnlyPin, micros: number): void {
        name.servoSetPulse(name.id, micros);
    }
}

namespace pxsim.pins {
    export function pulseDuration(): number {
        // bus last event timestamp
        return 500;
    }

    export function createBuffer(sz: number) {
        return pxsim.BufferMethods.createBuffer(sz)
    }

    export function i2cReadBuffer(address: number, size: number, repeat?: boolean): RefBuffer {
        // fake reading zeros
        return createBuffer(size)
    }

    export function i2cWriteBuffer(address: number, buf: RefBuffer, repeat?: boolean): void {
        // fake - noop
    }
}


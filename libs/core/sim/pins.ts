
namespace pxsim.pins {
    export class CommonPin extends Pin {
        used: boolean;
    }

    export class DigitalInOutPin extends CommonPin {
    }

    export class AnalogInOutPin extends CommonPin {

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

namespace pxsim.DigitalInOutPinMethods {
    export function digitalRead(name: pins.DigitalInOutPin): number {
        return name.digitalReadPin();
    }

    /**
    * Set a pin or connector value to either 0 or 1.
    * @param value value to set on the pin, 1 eg,0
    */
    export function digitalWrite(name: pins.DigitalInOutPin, value: number): void {
        name.digitalWritePin(value);
    }

    /**
    * Configures this pin to a digital input, and generates events where the timestamp is the duration
    * that this pin was either ``high`` or ``low``.
    */
    export function onPulsed(name: pins.DigitalInOutPin, high: boolean, body: RefAction): void {
        onEvent(name, high ? DAL.DEVICE_PIN_EVT_PULSE_HI : DAL.DEVICE_PIN_EVT_PULSE_LO, body);
    }

    export function onEvent(name: pins.DigitalInOutPin, ev: number, body: RefAction): void {
        name.onEvent(ev, body);
    }

    /**
    * Returns the duration of a pulse in microseconds
    * @param value the value of the pulse (default high)
    * @param maximum duration in micro-seconds
    */
    export function pulseIn(name: pins.DigitalInOutPin, high: boolean, maxDuration = 2000000): number {
        name.used = true;
        const pulse = high ? DAL.DEVICE_PIN_EVT_PULSE_HI : DAL.DEVICE_PIN_EVT_PULSE_LO;
        // Always return default value, can't simulate
        return 500;
    }

    /**
    * Configures the pull of this pin.
    * @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
    */
    export function setPull(name: pins.DigitalInOutPin, pull: number): void {
        name.setPull(pull);
    }

    /**
     * Get the pin state (pressed or not). Requires to hold the ground to close the circuit.
     * @param name pin used to detect the touch
     */
    export function isPressed(name: pins.DigitalInOutPin): boolean {
        return name.isTouched();
    }
}

namespace pxsim.AnalogInPinMethods {
    /**
     * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
     */
    export function analogRead(name: pins.AnalogInOutPin): number {
        pins.markUsed(name);
        return name.analogReadPin();
    }
}

namespace pxsim.AnalogOutPinMethods {
    /**
 * Set the connector value as analog. Value must be comprised between 0 and 1023.
 * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
 */
    export function analogWrite(name: pins.AnalogInOutPin, value: number): void {
        pins.markUsed(name);
        name.analogWritePin(value);

    }
}

namespace pxsim.PwmOnlyPinMethods {
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
    export function pinByCfg(key: number) {
        return pxsim.pxtcore.getPinCfg(key);
    }

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

    export function spiWrite(value: number): number {
        // TODO
        return 0;
    }

    export function spiMode(mode: number): void {
        // TODO
    }

    export function spiTransfer(command: RefBuffer, response: RefBuffer): number {
        // TODO
        return 0;
    }

    export function spiFrequency(f: number): void {
        // TODO
    }

    export function spiFormat(bits: number, mode: number): void {
        // TODO
    }

    export function spiPins(mosi: number, miso: number, sck: number) {
        // TODO
    }

    export function spi(): SPIDevice {
        const b = board();
        return b.edgeConnectorState.spi;
    }

    export function createSPI(mosi: DigitalInOutPin, miso: DigitalInOutPin, sck: DigitalInOutPin) {
        return new SPIDevice(mosi, miso, sck);
    }
}

namespace pxsim.SPIDeviceMethods {

    export function write(device: pxsim.SPIDevice, value: number) {
        return device.write(value);
    }

    export function transfer(device: pxsim.SPIDevice, command: RefBuffer, response: RefBuffer) {
        device.transfer(command, response);
    }

    export function setFrequency(device: pxsim.SPIDevice, frequency: number) {
        device.setFrequency(frequency);
    }

    export function setMode(device: pxsim.SPIDevice, mode: number) {
        device.setMode(mode);
    }
}


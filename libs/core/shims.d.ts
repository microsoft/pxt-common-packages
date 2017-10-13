// Auto-generated. Do not edit.


declare interface DigitalPin {
    /**
     * Read a pin or connector as either 0 or 1
     * @param name pin to read from
     */
    //% help=pins/digital-read weight=30
    //% blockId=device_get_digital_pin block="digital read|pin %name" blockGap=8
    //% parts="slideswitch" trackArgs=0
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=DigitalPinMethods::digitalRead
    digitalRead(): boolean;

    /**
     * Set a pin or connector value to either 0 or 1.
     * @param name pin to write to
     * @param value value to set on the pin
     */
    //% help=pins/digital-write weight=29
    //% blockId=device_set_digital_pin block="digital write|pin %name|to %value"
    //% parts="led" trackArgs=0
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220 
    //% name.fieldOptions.columns=4 shim=DigitalPinMethods::digitalWrite
    digitalWrite(value: boolean): void;

    /**
     * Make this pin a digital input, and create events where the timestamp is the duration
     * that this pin was either ``high`` or ``low``.
     */
    //% help=pins/on-pulsed weight=22 blockGap=8 advanced=true
    //% blockId=pins_on_pulsed block="on|pin %pin|pulsed %pulse"
    //% blockNamespace=pins
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.width=220
    //% pin.fieldOptions.columns=4 shim=DigitalPinMethods::onPulsed
    onPulsed(pulse: PulseValue, body: () => void): void;

    /**
     * Return the duration of a pulse in microseconds
     * @param name the pin which measures the pulse
     * @param value the value of the pulse (default high)
     * @param maximum duration in micro-seconds
     */
    //% blockId="pins_pulse_in" block="pulse in (µs)|pin %name|pulsed %value"
    //% weight=20 advanced=true
    //% help="pins/pulse-in"
    //% blockNamespace=pins
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.width=220
    //% pin.fieldOptions.columns=4 maxDuration.defl=2000000 shim=DigitalPinMethods::pulseIn
    pulseIn(value: PulseValue, maxDuration?: int32): int32;

    /**
     * Set the pull direction of this pin.
     * @param name pin to set the pull mode on
     * @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
     */
    //% help=pins/set-pull weight=3 advanced=true
    //% blockId=device_set_pull block="set pull|pin %pin|to %pull"
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=DigitalPinMethods::setPull
    setPull(pull: PinPullMode): void;
}


declare interface AnalogPin {
    /**
     * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
     * @param name pin to write to
     */
    //% help=pins/analog-read weight=25
    //% blockId=device_get_analog_pin block="analog read|pin %name" blockGap="8"
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=AnalogPinMethods::analogRead
    analogRead(): int32;

    /**
     * Set the connector value as analog. Value must be comprised between 0 and 1023.
     * @param name pin name to write to
     * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
     */
    //% help=pins/analog-write weight=24
    //% blockId=device_set_analog_pin block="analog write|pin %name|to %value" blockGap=8
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=AnalogPinMethods::analogWrite
    analogWrite(value: int32): void;
}


declare interface PwmPin {
    /**
     * Set the Pulse-width modulation (PWM) period of the analog output. The period is in
     * **microseconds** or `1/1000` milliseconds.
     * If this pin is not configured as an analog output (using `analog write pin`), the operation has
     * no effect.
     * @param name analog pin to set period to
     * @param micros period in micro seconds. eg:20000
     */
    //% help=pins/analog-set-period weight=23 blockGap=8
    //% blockId=device_set_analog_period block="analog set period|pin %pin|to (µs)%period"
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=PwmPinMethods::analogSetPeriod
    analogSetPeriod(period: int32): void;

    /**
     * Write a value to the servo to control the rotation of the shaft. On a standard servo, this will
     * set the angle of the shaft (in degrees), moving the shaft to that orientation. On a continuous
     * rotation servo, this will set the speed of the servo (with ``0`` being full-speed in one
     * direction, ``180`` being full speed in the other, and a value near ``90`` being no movement).
     * @param name pin to write to
     * @param value angle or rotation speed, eg:180,90,0
     */
    //% help=pins/servo-write weight=20
    //% blockId=device_set_servo_pin block="servo write|pin %name|to %value" blockGap=8
    //% parts=microservo trackArgs=0
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=PwmPinMethods::servoWrite
    servoWrite(value: int32): void;

    /**
     * Set the pin for PWM analog output, make the period be 20 ms, and set the pulse width.
     * The pulse width is based on the value it is given **microseconds** or `1/1000` milliseconds.
     * @param name pin name
     * @param duration pulse duration in micro seconds, eg:1500
     */
    //% help=pins/servo-set-pulse weight=19
    //% blockId=device_set_servo_pulse block="servo set pulse|pin %value|to (µs) %duration"
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=PwmPinMethods::servoSetPulse
    servoSetPulse(duration: int32): void;
}
declare namespace pins {

    /**
     * Create a new zero-initialized buffer.
     * @param size number of bytes in the buffer
     */
    //% shim=pins::createBuffer
    function createBuffer(size: int32): Buffer;

    /**
     * Get the duration of the last pulse in microseconds. This function should be called from a
     * ``onPulsed`` handler.
     */
    //% help=pins/pulse-duration advanced=true
    //% blockId=pins_pulse_duration block="pulse duration (µs)"
    //% weight=21 blockGap=8 shim=pins::pulseDuration
    function pulseDuration(): int32;
}
declare namespace pins {


    //% indexedInstanceNS=pins indexedInstanceShim=pxt::getPin
    //% fixedInstance shim=pxt::getPin(0)
    const A0: AnalogPin;


    //% fixedInstance shim=pxt::getPin(1)
    const A1: AnalogPin;


    //% fixedInstance shim=pxt::getPin(2)
    const A2: AnalogPin;


    //% fixedInstance shim=pxt::getPin(3)
    const A3: AnalogPin;


    //% fixedInstance shim=pxt::getPin(4)
    const A4: AnalogPin;


    //% fixedInstance shim=pxt::getPin(5)
    const A5: AnalogPin;


    //% fixedInstance shim=pxt::getPin(6)
    const A6: AnalogPin;


    //% fixedInstance shim=pxt::getPin(7)
    const A7: AnalogPin;


    //% fixedInstance shim=pxt::getPin(8)
    const A8: PwmPin;


    //% fixedInstance shim=pxt::getPin(9)
    const A9: PwmPin;


    //% fixedInstance shim=pxt::getPin(10)
    const A10: PwmPin;


    //% fixedInstance shim=pxt::getPin(11)
    const A11: PwmPin;


    //% fixedInstance shim=pxt::getPin(12)
    const D0: DigitalPin;


    //% fixedInstance shim=pxt::getPin(13)
    const D1: DigitalPin;


    //% fixedInstance shim=pxt::getPin(14)
    const D2: DigitalPin;


    //% fixedInstance shim=pxt::getPin(15)
    const D3: DigitalPin;


    //% fixedInstance shim=pxt::getPin(16)
    const D4: DigitalPin;


    //% fixedInstance shim=pxt::getPin(17)
    const D5: DigitalPin;


    //% fixedInstance shim=pxt::getPin(18)
    const D6: DigitalPin;


    //% fixedInstance shim=pxt::getPin(19)
    const D7: DigitalPin;


    //% fixedInstance shim=pxt::getPin(20)
    const D8: DigitalPin;


    //% fixedInstance shim=pxt::getPin(21)
    const D9: DigitalPin;


    //% fixedInstance shim=pxt::getPin(22)
    const D10: DigitalPin;


    //% fixedInstance shim=pxt::getPin(23)
    const D11: DigitalPin;


    //% fixedInstance shim=pxt::getPin(24)
    const D12: DigitalPin;


    //% fixedInstance shim=pxt::getPin(25)
    const D13: DigitalPin;


    //% fixedInstance shim=pxt::getPin(26)
    const RX: DigitalPin;


    //% fixedInstance shim=pxt::getPin(27)
    const TX: DigitalPin;
}
declare namespace control {

    /**
     * Announce that an event happened to registered handlers.
     * @param src ID of the MicroBit Component that generated the event
     * @param value Component specific code indicating the cause of the event.
     * @param mode optional definition of how the event should be processed after construction.
     */
    //% weight=21 blockGap=12 blockId="control_raise_event"
    //% help=control/raise-event
    //% block="raise event|from %src|with value %value" blockExternalInputs=1
    //% mode.defl=1 shim=control::raiseEvent
    function raiseEvent(src: int32, value: int32, mode?: EventCreationMode): void;

    /**
     * Determine the version of system software currently running.
     */
    //% blockId="control_device_dal_version" block="device dal version"
    //% help=control/device-dal-version shim=control::deviceDalVersion
    function deviceDalVersion(): string;

    /**
     * Allocates the next user notification event
     */
    //% help=control/allocate-notify-event shim=control::allocateNotifyEvent
    function allocateNotifyEvent(): int32;
}
declare namespace pins {

    /**
     * Read `size` bytes from a 7-bit I2C `address`.
     */
    //% repeat.defl=0 shim=pins::i2cReadBuffer
    function i2cReadBuffer(address: int32, size: int32, repeat?: boolean): Buffer;

    /**
     * Write bytes to a 7-bit I2C `address`.
     */
    //% repeat.defl=0 shim=pins::i2cWriteBuffer
    function i2cWriteBuffer(address: int32, buf: Buffer, repeat?: boolean): int32;
}

// Auto-generated. Do not edit. Really.

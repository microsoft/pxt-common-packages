// Auto-generated. Do not edit.
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
    const LED: DigitalPin;


    //% fixedInstance shim=pxt::getPin(27)
    const LEDRX: DigitalPin;


    //% fixedInstance shim=pxt::getPin(28)
    const LEDTX: DigitalPin;
}


declare interface DigitalPin {
    /**
     * Read the specified pin or connector as either 0 or 1
     * @param name pin to read from
     */
    //% help=pins/digital-read-pin weight=30
    //% blockId=device_get_digital_pin block="digital read|pin %name" blockGap=8
    //% blockNamespace=pins shim=DigitalPinMethods::digitalRead
    digitalRead(): number;

    /**
     * Set a pin or connector value to either 0 or 1.
     * @param name pin to write to
     * @param value value to set on the pin, 1 eg,0
     */
    //% help=pins/digital-write-pin weight=29
    //% blockId=device_set_digital_pin block="digital write|pin %name|to %value"
    //% blockNamespace=pins shim=DigitalPinMethods::digitalWrite
    digitalWrite(value: number): void;

    /**
     * Configures this pin to a digital input, and generates events where the timestamp is the duration
     * that this pin was either ``high`` or ``low``.
     */
    //% help=pins/on-pulsed weight=22 blockGap=8 advanced=true
    //% blockId=pins_on_pulsed block="on|pin %pin|pulsed %pulse"
    //% blockNamespace=pins shim=DigitalPinMethods::onPulsed
    onPulsed(pulse: PulseValue, body: () => void): void;

    /**
     * Returns the duration of a pulse in microseconds
     * @param name the pin which measures the pulse
     * @param value the value of the pulse (default high)
     * @param maximum duration in micro-seconds
     */
    //% blockId="pins_pulse_in" block="pulse in (µs)|pin %name|pulsed %value"
    //% weight=20 advanced=true
    //% blockNamespace=pins maxDuration.defl=2000000 shim=DigitalPinMethods::pulseIn
    pulseIn(value: PulseValue, maxDuration?: number): number;

    /**
     * Configures the pull of this pin.
     * @param name pin to set the pull mode on
     * @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
     */
    //% help=pins/set-pull weight=3 advanced=true
    //% blockId=device_set_pull block="set pull|pin %pin|to %pull"
    //% blockNamespace=pins shim=DigitalPinMethods::setPull
    setPull(pull: PinPullMode): void;
}


declare interface AnalogPin {
    /**
     * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
     * @param name pin to write to
     */
    //% help=pins/analog-read-pin weight=25
    //% blockId=device_get_analog_pin block="analog read|pin %name" blockGap="8"
    //% blockNamespace=pins shim=AnalogPinMethods::analogRead
    analogRead(): number;

    /**
     * Set the connector value as analog. Value must be comprised between 0 and 1023.
     * @param name pin name to write to
     * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
     */
    //% help=pins/analog-write-pin weight=24
    //% blockId=device_set_analog_pin block="analog write|pin %name|to %value" blockGap=8
    //% blockNamespace=pins shim=AnalogPinMethods::analogWrite
    analogWrite(value: number): void;
}


declare interface PwmPin {
    /**
     * Emits a Pulse-width modulation (PWM) signal for a given duration.
     * @param name the pin that modulate
     * @param frequency frequency to modulate in Hz.
     * @param ms duration of the pitch in milli seconds.
     */
    //% blockId=pin_analog_pitch block="analog pitch|pin %pin|at (Hz)%frequency|for (ms) %ms"
    //% help=pins/analog-pitch weight=4 async advanced=true blockGap=8
    //% blockNamespace=pins shim=PwmPinMethods::analogPitch
    analogPitch(frequency: number, ms: number): void;

    /**
     * Plays a tone through the pin for the given duration.
     * @param pin to play tone through
     * @param frequency pitch of the tone to play in Hertz (Hz)
     * @param ms tone duration in milliseconds (ms)
     */
    //% help=music/play-tone weight=90
    //% blockId=music_play_note block="play tone|on %pin|at %note=device_note|for %duration=device_beat" blockGap=8
    //% parts="headphone" async
    //% blockNamespace=music shim=PwmPinMethods::playTone
    playTone(frequency: number, ms: number): void;

    /**
     * Plays a tone through pin ``P0``.
     * @param pin to ring tone
     * @param frequency pitch of the tone to play in Hertz (Hz)
     */
    //% help=music/ring-tone weight=80
    //% blockId=music_ring block="ring tone|on %pin|at %note=device_note" blockGap=8
    //% parts="headphone" async
    //% blockNamespace=music shim=PwmPinMethods::ringTone
    ringTone(frequency: number): void;

    /**
     * Rests (plays nothing) for a specified time through pin ``P0``.
     * @param pin to rest
     * @param ms rest duration in milliseconds (ms)
     */
    //% help=music/rest weight=79
    //% blockId=music_rest block="rest|on %pin|for %duration=device_beat"
    //% parts="headphone" async
    //% blockNamespace=music shim=PwmPinMethods::rest
    rest(ms: number): void;

    /**
     * Configures the Pulse-width modulation (PWM) of the analog output to the given value in
     * **microseconds** or `1/1000` milliseconds.
     * If this pin is not configured as an analog output (using `analog write pin`), the operation has
     * no effect.
     * @param name analog pin to set period to
     * @param micros period in micro seconds. eg:20000
     */
    //% help=pins/analog-set-period weight=23 blockGap=8
    //% blockId=device_set_analog_period block="analog set period|pin %pin|to (µs)%micros"
    //% blockNamespace=pins shim=PwmPinMethods::analogSetPeriod
    analogSetPeriod(micros: number): void;

    /**
     * Writes a value to the servo, controlling the shaft accordingly. On a standard servo, this will
     * set the angle of the shaft (in degrees), moving the shaft to that orientation. On a continuous
     * rotation servo, this will set the speed of the servo (with ``0`` being full-speed in one
     * direction, ``180`` being full speed in the other, and a value near ``90`` being no movement).
     * @param name pin to write to
     * @param value angle or rotation speed, eg:180,90,0
     */
    //% help=pins/servo-write-pin weight=20
    //% blockId=device_set_servo_pin block="servo write|pin %name|to %value" blockGap=8
    //% parts=microservo trackArgs=0
    //% blockNamespace=pins shim=PwmPinMethods::servoWrite
    servoWrite(value: number): void;

    /**
     * Configures this IO pin as an analog/pwm output, configures the period to be 20 ms, and sets the
     * pulse width, based on the value it is given **microseconds** or `1/1000` milliseconds.
     * @param name pin name
     * @param micros pulse duration in micro seconds, eg:1500
     */
    //% help=pins/servo-set-pulse weight=19
    //% blockId=device_set_servo_pulse block="servo set pulse|pin %value|to (µs) %micros"
    //% blockNamespace=pins shim=PwmPinMethods::servoSetPulse
    servoSetPulse(micros: number): void;
}
declare namespace pins {

    /**
     * Create a new zero-initialized buffer.
     * @param size number of bytes in the buffer
     */
    //% shim=pins::createBuffer
    function createBuffer(size: number): Buffer;

    /**
     * Gets the duration of the last pulse in micro-seconds. This function should be called from a
     * ``onPulsed`` handler.
     */
    //% help=pins/pulse-duration advanced=true
    //% blockId=pins_pulse_duration block="pulse duration (µs)"
    //% weight=21 blockGap=8 shim=pins::pulseDuration
    function pulseDuration(): number;
}



    //% indexerGet=BufferMethods::getByte indexerSet=BufferMethods::setByte
declare interface Buffer {
    /**
     * Write a number in specified format in the buffer.
     */
    //% shim=BufferMethods::setNumber
    setNumber(format: NumberFormat, offset: number, value: number): void;

    /**
     * Read a number in specified format from the buffer.
     */
    //% shim=BufferMethods::getNumber
    getNumber(format: NumberFormat, offset: number): number;

    /** Returns the length of a Buffer object. */
    //% property shim=BufferMethods::length
    length: number;

    /**
     * Fill (a fragment) of the buffer with given value.
     */
    //% offset.defl=0 length.defl=-1 shim=BufferMethods::fill
    fill(value: number, offset?: number, length?: number): void;

    /**
     * Return a copy of a fragment of a buffer.
     */
    //% offset.defl=0 length.defl=-1 shim=BufferMethods::slice
    slice(offset?: number, length?: number): Buffer;

    /**
     * Shift buffer left in place, with zero padding.
     * @param offset number of bytes to shift; use negative value to shift right
     * @param start start offset in buffer. Default is 0.
     * @param length number of elements in buffer. If negative, length is set as the buffer length minus start. eg: -1
     */
    //% start.defl=0 length.defl=-1 shim=BufferMethods::shift
    shift(offset: number, start?: number, length?: number): void;

    /**
     * Rotate buffer left in place.
     * @param offset number of bytes to shift; use negative value to shift right
     * @param start start offset in buffer. Default is 0.
     * @param length number of elements in buffer. If negative, length is set as the buffer length minus start. eg: -1
     */
    //% start.defl=0 length.defl=-1 shim=BufferMethods::rotate
    rotate(offset: number, start?: number, length?: number): void;

    /**
     * Write contents of `src` at `dstOffset` in current buffer.
     */
    //% shim=BufferMethods::write
    write(dstOffset: number, src: Buffer): void;
}


    /**
     * Runtime and event utilities.
     */
    //% weight=70 color="#BEAA07" icon="\uf110"
declare namespace control {

    /**
     * Repeats the code forever in the background. On each iteration, allows other codes to run.
     * @param body code to execute
     */
    //% help=control/forever weight=100 blockGap=8
    //% blockId=forever block="forever" shim=control::forever
    function forever(a: () => void): void;

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=control/pause weight=99
    //% async block="pause (ms) %pause"
    //% blockId=device_pause shim=control::pause
    function pause(ms: number): void;

    /**
     * Gets the number of milliseconds elapsed since power on.
     */
    //% help=control/millis weight=50
    //% blockId=control_running_time block="millis (ms)" shim=control::millis
    function millis(): number;

    /**
     * Raises an event in the event bus.
     * @param src ID of the MicroBit Component that generated the event
     * @param value Component specific code indicating the cause of the event.
     * @param mode optional definition of how the event should be processed after construction.
     */
    //% weight=21 blockGap=12 blockId="control_raise_event" block="raise event|from %src|with value %value" blockExternalInputs=1
    //% advanced=true mode.defl=1 shim=control::raiseEvent
    function raiseEvent(src: number, value: number, mode?: EventCreationMode): void;

    /**
     * Raises an event in the event bus.
     * @param id the event compoent id
     * @param value the event value to match
     */
    //% weight=20 blockGap=8 blockId="control_on_event" block="on event|from %src|with value %value"
    //% blockExternalInputs=1 advanced=true shim=control::onEvent
    function onEvent(id: number, value: number, handler: () => void): void;

    /**
     * Resets the device.
     */
    //% weight=30 async help=control/reset blockGap=8
    //% blockId="control_reset" block="reset" shim=control::reset
    function reset(): void;

    /**
     * Blocks the current fiber for the given microseconds
     * @param micros number of micro-seconds to wait. eg: 4
     */
    //% help=control/wait-micros weight=29
    //% blockId="control_wait_us" block="wait (µs)%micros" advanced=true shim=control::waitMicros
    function waitMicros(micros: number): void;

    /**
     * Schedules code that run in the background.
     */
    //% help=control/run-in-background blockAllowMultiple=1 advanced=true
    //% blockId="control_run_in_background" block="run in background" blockGap=8 shim=control::runInBackground
    function runInBackground(a: () => void): void;

    /**
     * Derive a unique, consistent serial number of this device from internal data.
     */
    //% blockId="control_device_serial_number" block="device serial number" weight=9
    //% advanced=true shim=control::deviceSerialNumber
    function deviceSerialNumber(): number;

    /**
     * Determine the version of system software currently running.
     */
    //% shim=control::deviceDalVersion
    function deviceDalVersion(): string;
}



    //% weight=2 color=30 icon="\uf287"
    //% advanced=true
declare namespace serial {

    /**
     * Sends a piece of text through Serial connection.
     */
    //% help=serial/write-string
    //% weight=87
    //% blockId=serial_writestring block="serial|write string %text" shim=serial::writeString
    function writeString(text: string): void;
}



    //% color=300 weight=100
declare namespace light {

    /**
     * Gets the default pin for built in neopixels
     */
    //% parts="neopixel" shim=light::defaultPin
    function defaultPin(): DigitalPin;

    /**
     * Sends a neopixel buffer to the specified digital pin
     * @param pin The pin that the neopixels are connected to
     * @param buf The buffer to send to the pin
     */
    //% parts="neopixel" shim=light::sendBuffer
    function sendBuffer(pin: DigitalPin, buf: Buffer): void;
}
declare namespace input {

    /**
     * Left button.
     */
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getButton
    //% block="left button" weight=95 fixedInstance shim=pxt::getButton(0)
    const leftButton: Button;

    /**
     * Right button.
     */
    //% block="right button" weight=94 fixedInstance shim=pxt::getButton(1)
    const rightButton: Button;

    /**
     * Slide switch.
     */
    //% block="slide switch" weight=90 fixedInstance shim=pxt::getButton(2)
    const slideSwitch: Button;

    /**
     * Left and Right button.
     */
    //% block="left+right buttons" weight=93 fixedInstance shim=pxt::getButton(3)
    const leftAndRightButtons: Button;

    /**
     * Capacitive pin A4
     */
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getTouchButton
    //% block="pin A4" fixedInstance shim=pxt::getTouchButton(0)
    const pinA4: Button;

    /**
     * Capacitive pin A5
     */
    //% block="pin A5" fixedInstance shim=pxt::getTouchButton(1)
    const pinA5: Button;

    /**
     * Capacitive pin A6
     */
    //% block="pin A6" fixedInstance shim=pxt::getTouchButton(2)
    const pinA6: Button;

    /**
     * Capacitive pin A7
     */
    //% block="pin A7" fixedInstance shim=pxt::getTouchButton(3)
    const pinA7: Button;

    /**
     * Capacitive pin A8
     */
    //% block="pin A8" fixedInstance shim=pxt::getTouchButton(4)
    const pinA8: Button;

    /**
     * Capacitive pin A9
     */
    //% block="pin A9" fixedInstance shim=pxt::getTouchButton(5)
    const pinA9: Button;

    /**
     * Capacitive pin A10
     */
    //% block="pin A10" fixedInstance shim=pxt::getTouchButton(6)
    const pinA10: Button;

    /**
     * Capacitive pin A11
     */
    //% block="pin A11" fixedInstance shim=pxt::getTouchButton(7)
    const pinA11: Button;
}



    //% noRefCounting fixedInstances
declare interface Button {
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
    //% blockGap=8 shim=ButtonMethods::onEvent
    onEvent(ev: ButtonEvent, body: () => void): void;

    /**
     * Get the button state (pressed or not).
     * @param button the button to query the request
     */
    //% help=input/button-is-pressed weight=79
    //% block="%NAME|is pressed"
    //% blockId=buttonIsPressed
    //% blockGap=8
    //% parts="buttonpair"
    //% blockNamespace=input shim=ButtonMethods::isPressed
    isPressed(): boolean;

    /**
     * Indicates if the button was pressed since this function was last called.
     * @param button the button to query the request
     */
    //% help=input/button-was-pressed weight=78
    //% block="%NAME|was pressed"
    //% blockId=buttonWasPressed
    //% parts="buttonpair"
    //% blockNamespace=input shim=ButtonMethods::wasPressed
    wasPressed(): boolean;
}
declare namespace input {

    /**
     * Do something when the slide switch is moved left or right.
     *
     * @param direction the direction the switch must be moved to trigget the event
     */
    //% help=input/on-switch-moved weight=93
    //% blockId=device_on_switch_moved block="on switch moved %direction" blockGap=8
    //% parts="switch" shim=input::onSwitchMoved
    function onSwitchMoved(direction: SwitchDirection, handler: () => void): void;
}
declare namespace input {


    //% indexedInstanceNS=input indexedInstanceShim=pxt::getLightButton
    //% block="light sensor" fixedInstance shim=pxt::getLightButton(0)
    const lightSensor: Button;


    //% indexedInstanceNS=input indexedInstanceShim=pxt::getMicrophoneButton
    //% block="microphone" fixedInstance shim=pxt::getMicrophoneButton(0)
    const microphone: Button;
}



    //% color="#FB48C7" weight=99 icon="\uf192"
declare namespace input {

    /**
     * Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
     * @param condition the condition that event triggers on
     */
    //% help=input/on-light-condition-changed weight=97
    //% blockId=input_on_light_condition_changed block="on light %condition"
    //% parts="lightsensor" blockGap=8 shim=input::onLightConditionChanged
    function onLightConditionChanged(condition: LightCondition, handler: () => void): void;

    /**
     * Reads the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
     */
    //% help=input/light-level weight=76
    //% blockId=device_get_light_level block="light level" blockGap=8
    //% parts="lightsensor" shim=input::lightLevel
    function lightLevel(): number;

    /**
     * Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
     * @param condition the condition that event triggers on
     */
    //% help=input/on-loudness-condition-changed weight=97
    //% blockId=input_on_loudness_condition_changed block="on sound %condition"
    //% parts="microphone" blockGap=8 shim=input::onSoundConditionChanged
    function onSoundConditionChanged(condition: LoudnessCondition, handler: () => void): void;

    /**
     * Reads the loudness through the microphone from 0 (silent) to 255 (very loud)
     */
    //% help=input/loudness weight=75
    //% blockId=device_get_sound_level block="sound level" blockGap=8
    //% parts="microphone" shim=input::soundLevel
    function soundLevel(): number;

    /**
     * Registers an event raised when the temperature condition (hold, cold) changes.
     * @param condition the condition, hot or cold, the event triggers on
     * @param temperature the temperature, in degree Celsius, at which this event happens, eg: 15
     */
    //% blockId=input_on_temperature_condition_changed block="on temperature %condition|at (°C)%temperature"
    //% parts="thermometer" weight=95 blockGap=8
    //% help=input/on-temperature-condition-changed shim=input::onTemperateConditionChanged
    function onTemperateConditionChanged(condition: TemperatureCondition, temperature: number, handler: () => void): void;

    /**
     * Gets the temperature in Celsius or Fahrenheit degrees.
     */
    //% weight=75
    //% help=input/temperature
    //% blockId=device_temperature block="temperature in %unit" blockGap=8
    //% parts="thermometer" shim=input::temperature
    function temperature(unit: TemperatureUnit): number;
}
declare namespace input {

    /**
     * Do something when when a gesture is done (like shaking the micro:bit).
     * @param gesture the type of gesture to track, eg: Gesture.Shake
     * @param body code to run when gesture is raised
     */
    //% help=input/on-gesture weight=98 blockGap=8
    //% blockId=device_gesture_event block="on |%NAME"
    //% parts="accelerometer" shim=input::onGesture
    function onGesture(gesture: Gesture, body: () => void): void;

    /**
     * Get the acceleration value in milli-gravitys (when the board is laying flat with the screen up,
     * x=0, y=0 and z=-1024)
     * @param dimension TODO
     */
    //% help=input/acceleration weight=76
    //% blockId=device_acceleration block="acceleration (mg)|%NAME" blockGap=8
    //% parts="accelerometer" shim=input::acceleration
    function acceleration(dimension: Dimension): number;

    /**
     * The pitch or roll of the device, rotation along the ``x-axis`` or ``y-axis``, in degrees.
     * @param kind TODO
     */
    //% help=input/rotation weight=87
    //% blockId=device_get_rotation block="rotation (°)|%NAME" blockGap=8
    //% parts="accelerometer" advanced=true shim=input::rotation
    function rotation(kind: Rotation): number;

    /**
     * Sets the accelerometer sample range in gravities.
     * @param range a value describe the maximum strengh of acceleration measured
     */
    //% help=input/set-accelerometer-range
    //% blockId=device_set_accelerometer_range block="set accelerometer|range %range"
    //% weight=5
    //% parts="accelerometer"
    //% advanced=true shim=input::setAccelerometerRange
    function setAccelerometerRange(range: AcceleratorRange): void;
}

// Auto-generated. Do not edit. Really.

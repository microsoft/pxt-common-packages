// Auto-generated. Do not edit.
declare namespace pins {

    /**
     * Create a new rotary encoder connected to given pins
     */
    //% shim=pins::createRotaryEncoder
    function createRotaryEncoder(pinA: DigitalInOutPin, pinB: DigitalInOutPin): RotaryEncoder;
}



    //% noRefCounting fixedInstances
declare interface RotaryEncoder {
    /**
     * Do something when a rotary encoder changes position
     */
    //% shim=RotaryEncoderMethods::onChanged
    onChanged(body: () => void): void;

    /**
     * Get current encoder position.
     */
    //% property shim=RotaryEncoderMethods::position
    position: int32;
}

// Auto-generated. Do not edit. Really.

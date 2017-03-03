// Auto-generated. Do not edit.



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

// Auto-generated. Do not edit. Really.

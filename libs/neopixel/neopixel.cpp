#include "pxt.h"
#include "neopixel.h"

//% color="#0078d7" weight=98
namespace light {

    /**
     * Gets the default pin for built in neopixels
     */
    //% parts="neopixel"
    DigitalPin defaultPin() {
        return lookupPin(PIN_NEOPIXEL);
    }

    /**
     * Sends a neopixel buffer to the specified digital pin
     * @param pin The pin that the neopixels are connected to
     * @param buf The buffer to send to the pin
     */
    //% parts="neopixel"
    void sendBuffer(DigitalPin pin, Buffer buf) {
        neopixel_send_buffer(*pin, buf->payload, buf->length);
    }

}

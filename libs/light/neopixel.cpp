#include "pxt.h"
#include "neopixel.h"

/**
 * Functions to operate colored LEDs.
 */
//% weight=100 color="#0078d7" icon="\uf00a"
namespace light {

/**
 * Get the default pin for the built-in neopixels
 */
//% parts="neopixel"
//% help=light/default-pin
DigitalInOutPin defaultPin() {
    int pinName = PIN(NEOPIXEL);
    if (pinName < 0) {
        pinName = PA11;
    }

    return lookupPin(pinName);
}

/**
 * Send a neopixel buffer to the specified digital pin
 * @param pin The pin that the neopixels are connected to
 * @param mode the color encoding mode
 * @param buf The buffer to send to the pin
 */
//% parts="neopixel"
void sendBuffer(DigitalInOutPin pin, int mode, Buffer buf) {
#if NEOPIXEL_SPI
    if (mode & 0x100)
        spiNeopixelSendBuffer(pin, buf->data, buf->length);
    else
#endif
        neopixel_send_buffer(*pin, buf->data, buf->length);
}

} // namespace light

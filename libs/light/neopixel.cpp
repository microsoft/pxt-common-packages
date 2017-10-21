#include "pxt.h"
#include "neopixel.h"


/**
 * Functions to operate colored LEDs.
 */
//% weight=100 color="#0078d7" icon="\uf00a"
namespace light {

    /**
     * Gets the default pin for built in neopixels
     */
    //% parts="neopixel"
    //% blockId="light_default_pin" block="default pixel pin"
    //% help=light/default-pin
    DigitalPin defaultPin() {
        #if PXT_BOARD_ID == BOARD_ID_METRO
        // Metro express neopixel pin is set for SWD by default
        PORT->Group[PIN_NEOPIXEL / 32].PINCFG[PIN_NEOPIXEL % 32].reg=(uint8_t)(PORT_PINCFG_INEN) ;
        #endif
        if (PIN_NEOPIXEL == NC)
            return lookupPin(PIN_PA11);
        else
            return lookupPin(PIN_NEOPIXEL);
    }

    /**
     * Sends a neopixel buffer to the specified digital pin
     * @param pin The pin that the neopixels are connected to
     * @param mode the color encoding mode
     * @param buf The buffer to send to the pin
     */
    //% parts="neopixel"
    void sendBuffer(DigitalPin pin, int mode, Buffer buf) {
        neopixel_send_buffer(*pin, buf->data, buf->length);
    }

}

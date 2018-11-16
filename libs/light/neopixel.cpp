#include "pxt.h"
#include "neopixel.h"

#define NEOPIXEL_SPI 1

#ifdef NEOPIXEL_SPI
static codal::SPI *spi = NULL;
static void initSPI(DevicePin *mosi) {
    DevicePin *noPin = NULL;
    if (NULL == spi) {
        spi = new CODAL_SPI(*mosi, *noPin, *noPin);
        spi->setFrequency(2400000);
    }
}
#endif

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
#ifdef NEOPIXEL_SPI

    int32_t iptr = 0, optr = 100;
    uint32_t len = optr + buf->length * 3 + optr;
    uint8_t *expBuf = new uint8_t[len];
    memset(expBuf, 0, len);
    uint8_t imask = 0x80;
    uint8_t omask = 0x80;

#define WR(k)                                                                                      \
    if (k)                                                                                         \
        expBuf[optr] |= omask;                                                                     \
    omask >>= 1;                                                                                   \
    if (!omask) {                                                                                  \
        omask = 0x80;                                                                              \
        optr++;                                                                                    \
    }

    while (iptr < buf->length) {
        WR(1);
        WR(buf->data[iptr] & imask);
        imask >>= 1;
        if (!imask) {
            imask = 0x80;
            iptr++;
        }
        WR(0);
    }

    initSPI(pin);
    spi->transfer(expBuf, len, NULL, 0);
    delete expBuf;
#else
    neopixel_send_buffer(*pin, buf->data, buf->length);
#endif
}

} // namespace light

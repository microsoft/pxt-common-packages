#include "pxt.h"
#include "ErrorNo.h"

namespace pins {
static codal::SPI *spi = NULL;
static void initSPI() {
    if (NULL == spi)
        spi = new CODAL_SPI(*LOOKUP_PIN(MOSI), *LOOKUP_PIN(MISO), *LOOKUP_PIN(SCK));
}

/**
 * Write to the SPI slave and return the response
 * @param value Data to be sent to the SPI slave
 */
//% help=pins/spi-write weight=5 advanced=true
//% blockId=spi_write block="spi write %value"
int spiWrite(int value) {
    initSPI();
    return spi->write(value);
}

/**
 * Writes a given command to SPI bus, and afterwards reads the response.
 */
//% help=pins/spi-transfer weight=4 advanced=true
//% blockId=spi_transfer block="spi transfer %command into %response"
void spiTransfer(Buffer command, Buffer response) {
    initSPI();
    auto cdata = NULL == command ? NULL : command->data;
    auto clength = NULL == command ? 0 : command->length;
    auto rdata = NULL == response ? NULL : response->data;
    auto rlength = NULL == response ? 0 : response->length;
    spi->transfer(cdata, clength, rdata, rlength);
}

/**
 * Sets the SPI frequency
 * @param frequency the clock frequency, eg: 1000000
 */
//% help=pins/spi-frequency weight=4 advanced=true
//% blockId=spi_frequency block="spi frequency %frequency"
void spiFrequency(int frequency) {
    initSPI();
    spi->setFrequency(frequency);
}

/**
 * Sets the SPI mode and bits
 * @param mode the mode, eg: 3
 */
//% help=pins/spi-mode weight=3 advanced=true
//% blockId=spi_mode block="spi mode %mode"
void spiMode(int mode) {
    initSPI();
    spi->setMode(mode);
}
} // namespace pins

#if NEOPIXEL_SPI
namespace pxt {
static codal::SPI *spi = NULL;
static void initSPI(DevicePin *mosi) {
    DevicePin *noPin = NULL;
    if (NULL == spi) {
        spi = new CODAL_SPI(*mosi, *noPin, *noPin);
        spi->setFrequency(2400000);
    }
}

void spiNeopixelSendBuffer(DigitalInOutPin pin, const uint8_t *data, unsigned size) {
    int32_t iptr = 0, optr = 100;
    uint32_t len = optr + size * 3 + optr;
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

    while (iptr < (int)size) {
        WR(1);
        WR(data[iptr] & imask);
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
}
} // namespace pxt

#endif

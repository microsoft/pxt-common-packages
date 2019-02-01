#include "pxt.h"
#include "ErrorNo.h"

namespace pins {

class CodalSpiDevice {
private:
    CODAL_SPI spi;

public:
    CodalSpiDevice(DevicePin* mosi, DevicePin* miso, DevicePin* sck)
        : spi(*mosi, *miso, *sck) 
    {
    }

    int write(int value) {
        return spi.write(value);
    }

    void transfer(Buffer command, Buffer response) {
        auto cdata = NULL == command ? NULL : command->data;
        auto clength = NULL == command ? 0 : command->length;
        auto rdata = NULL == response ? NULL : response->data;
        auto rlength = NULL == response ? 0 : response->length;
        spi.transfer(cdata, clength, rdata, rlength);
    }

    void setFrequency(int frequency) {
        spi.setFrequency(frequency);
    }

    void setMode(int mode) {
        spi.setMode(mode);
    }
};

typedef CodalSpiDevice* SpiDevice;

/**
* Opens a SPI driver
*/
//% parts=spi
SpiDevice createSpi(DevicePin* mosiPin, DevicePin* misoPin, DevicePin* sckPin) {
    return new CodalSpiDevice(mosiPin, misoPin, sckPin);
}

}

namespace SpiDeviceMethods {

//%
int write(SpiDevice device, int value) {
    return device->write(value);
}

//% 
void transfer(SpiDevice device, Buffer command, Buffer response) {
    device->transfer(command, response);
}

//%
void setFrequency(SpiDevice device, int frequency) {
    device->setFrequency(frequency);
}

//%
void setMode(SpiDevice device, int mode) {
    device->setMode(mode);
}

}

namespace pins {

static SpiDevice _spi = NULL;


/**
* Gets the default SPI driver
*/
//%
SpiDevice spi() {
    if (NULL == _spi)
        _spi = createSpi(LOOKUP_PIN(MOSI), LOOKUP_PIN(MISO), LOOKUP_PIN(SCK));
    return _spi;
}

/**
 * Write to the SPI slave and return the response
 * @param value Data to be sent to the SPI slave
 */
//% help=pins/spi-write weight=5 advanced=true
//% blockId=spi_write block="spi write %value"
int spiWrite(int value) {
    return spi()->write(value);
}

/**
 * Writes a given command to SPI bus, and afterwards reads the response.
 */
//% help=pins/spi-transfer weight=4 advanced=true
//% blockId=spi_transfer block="spi transfer %command into %response"
void spiTransfer(Buffer command, Buffer response) {
    spi()->transfer(command, response);
}

/**
 * Sets the SPI frequency
 * @param frequency the clock frequency, eg: 1000000
 */
//% help=pins/spi-frequency weight=4 advanced=true
//% blockId=spi_frequency block="spi frequency %frequency"
void spiFrequency(int frequency) {
    spi()->setFrequency(frequency);
}

/**
 * Sets the SPI mode and bits
 * @param mode the mode, eg: 3
 */
//% help=pins/spi-mode weight=3 advanced=true
//% blockId=spi_mode block="spi mode %mode"
void spiMode(int mode) {
    spi()->setMode(mode);
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

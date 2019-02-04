#include "pxt.h"
#include "ErrorNo.h"

namespace pins {

class CodalSPIProxy {
private:
    DevicePin* mosi; 
    DevicePin* miso; 
    DevicePin* sck;
    CODAL_SPI spi;
public:
    CodalSPIProxy* next;

public:
    CodalSPIProxy(DevicePin* _mosi, DevicePin* _miso, DevicePin* _sck)
        : mosi(_mosi)
        , miso(_miso)
        , sck(_sck)
        , spi(*_mosi, *_miso, *_sck) 
        , next(NULL)
    {
    }

    bool matchPins(DevicePin* mosi, DevicePin* miso, DevicePin* sck) {
        return this->mosi == mosi && this->miso == miso && this->sck == sck;
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

SPI_ spis(NULL);

/**
* Opens a SPI driver
*/
//% help=pins/create-spi
//% parts=spi
SPI_ createSPI(DigitalInOutPin mosiPin, DigitalInOutPin misoPin, DigitalInOutPin sckPin) {
  auto dev = spis;
  while(dev) {
    if (dev->matchPins(mosiPin, misoPin, sckPin))
      return dev;
    dev = dev->next;
  }

  auto ser = new CodalSPIProxy(mosiPin, misoPin, sckPin);
  ser->next = spis;
  spis = ser;
  return ser;
}

}

namespace SPIMethods {

/**
* Write to the SPI bus
*/
//%
int write(SPI_ device, int value) {
    return device->write(value);
}

/**
* Transfer buffers over the SPI bus
*/
//% 
void transfer(SPI_ device, Buffer command, Buffer response) {
    device->transfer(command, response);
}

/**
* Sets the SPI clock frequency
*/
//%
void setFrequency(SPI_ device, int frequency) {
    device->setFrequency(frequency);
}

/**
* Sets the SPI bus mode
*/
//%
void setMode(SPI_ device, int mode) {
    device->setMode(mode);
}

}

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

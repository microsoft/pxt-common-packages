#include "light.h"

namespace light {
//declarations
void spiNeopixelSendBuffer(DevicePin* pin, const uint8_t *data, unsigned size);

}

#ifdef SAMD21
#include "neopixel.h"
#endif

namespace light {
bool isValidSPIPin(DigitalInOutPin pin) {
    if (!pin)
        return false;

#if SAMD51
    return ZSPI::isValidMOSIPin(*pin);
#else
    // TODO
    return false;
#endif

}

void clear() {
    auto neopix = LOOKUP_PIN(NEOPIXEL);
    if (neopix) {
        auto num = getConfig(CFG_NUM_NEOPIXELS, 0);
        if (num <= 0) return; // wrong length

        auto n = 3 * num;
        uint8_t off[n];
        memset(off, 0, sizeof(off));
        light::sendData(neopix, 0x100, off, sizeof(off));
    }
}

void sendData(DevicePin* pin, int mode, const uint8_t* data, unsigned length) {
    if (!pin || !length) return;

    if (isValidSPIPin(pin) && mode & 0x100) {
        spiNeopixelSendBuffer(pin, data, length);
    }
#if SAMD21
    else {
        neopixel_send_buffer(*pin, data, length);
    }
#endif
}

void sendBuffer(DevicePin* pin, int mode, Buffer buf) {
    if (!pin || !buf || !buf->length) return;
    light::sendData(pin, mode, buf->data, buf->length);
}

// SPI
static codal::SPI *spi = NULL;
static void initSPI(DevicePin *mosi) {
    DevicePin *noPin = NULL;
    if (NULL == spi) {
        spi = new CODAL_SPI(*mosi, *noPin, *noPin);
        spi->setFrequency(2400000);
    }
}

void spiNeopixelSendBuffer(DevicePin* pin, const uint8_t *data, unsigned size) {
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

void sendPixelBuffer(Buffer buf) {
    if (!buf || !buf->length) return;

    auto dat = LOOKUP_PIN(DOTSTAR_DATA);
    if (dat) {
        auto clk = LOOKUP_PIN(DOTSTAR_CLOCK);
        if (!clk) {
            DMESG("pixel: missing DOTSTAR_CLOCK config");
            return;
        }
        // first frame of zeroes
        dat->setDigitalValue(0);
        for (int i = 0; i < 32; ++i) {
            clk->setDigitalValue(1);
            clk->setDigitalValue(0);
        }
        // data stream
        for (int i = 0; i < buf->length; ++i) {
            int x = buf->data[i];
            for (uint8_t i = 0x80; i != 0; i >>= 1) {
                dat->setDigitalValue(x & i ? 1 : 0);
                clk->setDigitalValue(1);
                clk->setDigitalValue(0);
            }
        }
        // last frame of 1s
        dat->setDigitalValue(1);
        for (int i = 0; i < 32; ++i) {
            clk->setDigitalValue(1);
            clk->setDigitalValue(0);
        }

        return;
    }

    auto neo = LOOKUP_PIN(NEOPIXEL);
    if (neo) {
        light::sendData(neo, 0x100, buf->data, buf->length);
        return;
    }

    DMESG("pixel: not supported or configured");
}

} // namespace pxt

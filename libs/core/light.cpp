#include "light.h"

#ifdef SAMD21
#include "neopixel.h"
#endif

#define NEOPIXEL_MIN_LENGTH_FOR_SPI 8
#define DOTSTAR_MIN_LENGTH_FOR_SPI 8

#define LIGHTMODE_RGB 1
#define LIGHTMODE_RGBW 2 
#define LIGHTMODE_RGB_RGB 3
#define LIGHTMODE_DOTSTAR 4

namespace light {
bool isValidMOSIPin(DigitalInOutPin pin) {
    if (!pin)
        return false;

#if SAMD51
    return ZSPI::isValidMOSIPin(*pin);
#else
    // TODO: support for SPI neopixels
    // default SPI pins supported for now
    return pin == LOOKUP_PIN(MOSI);
#endif

}

// SPI
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

    auto spi = pxt::getSPI(pin, NULL, NULL);
    spi->setFrequency(2400000);
    spi->transfer(expBuf, len, NULL, 0);
    delete expBuf;
}

void neopixelSendData(DevicePin* pin, int mode, const uint8_t* data, unsigned length) {
    if (!pin || !length) return;

#if SAMD21
    if (length > NEOPIXEL_MIN_LENGTH_FOR_SPI && isValidMOSIPin(pin))
        spiNeopixelSendBuffer(pin, data, length);
    else
        neopixel_send_buffer(*pin, data, length);
#else    
    if (isValidMOSIPin(pin)) {
        spiNeopixelSendBuffer(pin, data, length);
    }
#endif
}

void bitBangDotStarSendData(DevicePin* data, DevicePin* clk, int mode, const uint8_t* buf, unsigned length) {
    // first frame of zeroes
    data->setDigitalValue(0);
    for (unsigned i = 0; i < 32; ++i) {
        clk->setDigitalValue(1);
        clk->setDigitalValue(0);
    }

    // data stream
    for (unsigned i = 0; i < length; ++i) {
        auto x = buf[i];
        for (uint8_t j = 0x80; j != 0; j >>= 1) {
            data->setDigitalValue(x & j ? 1 : 0);
            clk->setDigitalValue(1);
            clk->setDigitalValue(0);
        }
    }
    // https://cpldcpu.wordpress.com/2016/12/13/sk9822-a-clone-of-the-apa102/
    // reset frame
    //data->setDigitalValue(0);
    //for (unsigned i = 0; i < 32 ; ++i) {
    //    clk->setDigitalValue(1);
    //    clk->setDigitalValue(0);
    //}

    // https://cpldcpu.wordpress.com/2014/11/30/understanding-the-apa102-superled/
    data->setDigitalValue(1);
    unsigned n = 32;
    for (unsigned i = 0; i < n; ++i) {
        clk->setDigitalValue(1);
        clk->setDigitalValue(0);
    }
}

static uint8_t ZERO_FRAME[4];
static uint8_t ONE_FRAME[] = {1,1,1,1};
void spiDotStarSendData(DevicePin* data, DevicePin* clk, int mode, const uint8_t* buf, unsigned length) {
    auto spi = pxt::getSPI(data, NULL, clk);

    spi->transfer(ZERO_FRAME, sizeof(ZERO_FRAME), NULL, 0); // initial frame
    spi->transfer(buf, length, NULL, 0);
    spi->transfer(ZERO_FRAME, sizeof(ZERO_FRAME), NULL, 0); // reset frame
    for(unsigned i = 0; i < length >> 3; i += 32)
        spi->transfer(ONE_FRAME, sizeof(ONE_FRAME), NULL, 0); // final frame
}

void dotStarSendData(DevicePin* data, DevicePin* clk, int mode, const uint8_t* buf, unsigned length) {
    if (!data || !clk || !buf || !length) return;

    if (length > DOTSTAR_MIN_LENGTH_FOR_SPI && isValidMOSIPin(data))
        spiDotStarSendData(data, clk, mode, buf, length);
    else 
        bitBangDotStarSendData(data, clk, mode, buf, length);
}

void sendBuffer(DevicePin* data, DevicePin* clk, int mode, Buffer buf) {
    if (!data || !buf || !buf->length) return;

    if (mode == LIGHTMODE_DOTSTAR)
        light::dotStarSendData(data, clk, mode, buf->data, buf->length);
    else
        light::neopixelSendData(data, mode, buf->data, buf->length);
}


void clear() {
    auto neopix = LOOKUP_PIN(NEOPIXEL);
    auto neonum = getConfig(CFG_NUM_NEOPIXELS, 0);
    if (neopix && neonum >= 0) {
        auto n = 3 * neonum;
        uint8_t off[n];
        memset(off, 0, sizeof(off));
        light::neopixelSendData(neopix, 0x100, off, sizeof(off));
    }

    auto data = LOOKUP_PIN(DOTSTAR_DATA);
    auto clk = LOOKUP_PIN(DOTSTAR_CLOCK);
    auto dsnum = getConfig(CFG_NUM_DOTSTARS, 0);
    if (data && clk && dsnum > 0) {
        auto n = 4 * dsnum;
        uint8_t off[n];
        memset(off, 0, sizeof(off));
        for(int i = 0; i < n; i += 4)
            off[i] = 0xe0;
        bitBangDotStarSendData(data, clk, 0x100, off, sizeof(off));
    }
}

} // namespace pxt

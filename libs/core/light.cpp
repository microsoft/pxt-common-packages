#include "light.h"

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
    // TODO: support for SPI neopixels
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
        light::neopixelSendData(neopix, 0x100, off, sizeof(off));
    }
}

void neopixelSendData(DevicePin* pin, int mode, const uint8_t* data, unsigned length) {
    if (!pin || !length) return;

    if (length > 10 && isValidSPIPin(pin)) {
        spiNeopixelSendBuffer(pin, data, length);
    }
#if SAMD21
    // TODO bit banging for all cpus
    else {
        neopixel_send_buffer(*pin, data, length);
    }
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

void dotStarSendData(DevicePin* data, DevicePin* clk, const uint8* buf, unsigned length) {
    if (!data || !clk || !buf || !length) return;
    // first frame of zeroes
    dat->setDigitalValue(0);
    for (int i = 0; i < 32; ++i) {
        clk->setDigitalValue(1);
        clk->setDigitalValue(0);
    }
    // data stream
    for (int i = 0; i < length; ++i) {
        int x = buf->data[i];
        for (uint8_t i = 0x80; i != 0; i >>= 1) {
            dat->setDigitalValue(x & i ? 1 : 0);
            clk->setDigitalValue(1);
            clk->setDigitalValue(0);
        }
    }
    // https://cpldcpu.wordpress.com/2016/12/13/sk9822-a-clone-of-the-apa102/
    // reset frame
    dat->setDigitalValue(0);
    for (int i = 0; i < 32 ; ++i) {
        clk->setDigitalValue(1);
        clk->setDigitalValue(0);
    }

    // last frame of 1s
    dat->setDigitalValue(1);
    // https://cpldcpu.wordpress.com/2014/11/30/understanding-the-apa102-superled/
    auto n = max(32, length >> 2 + 1);
    for (int i = 0; i < n; ++i) {
        clk->setDigitalValue(1);
        clk->setDigitalValue(0);
    }
}

void sendBuffer(DevicePin* data, Device* clk, int mode, Buffer buf) {
    if (!pin || !buf || !buf->length) return;

    if (dataPin && clkPin)
        light::dotStarSendData(data, clk, buf, buf->length);
    else
        light::neopixelSendData(data, mode, buf->data, buf->length);
}

} // namespace pxt

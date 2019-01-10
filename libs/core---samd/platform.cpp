#include "pxt.h"

namespace pxt {

SAMDTCCTimer devTccTimer(TCC0, TCC0_IRQn);
CODAL_TIMER devTimer(devTccTimer);

static void initRandomSeed() {
    int seed = 0xC0DA1;
    // TODO use TRNG
    seedRandom(seed);
}

void platformSendSerial(const char *data, int len) {}

void platform_init() {
    initRandomSeed();
    setSendToUART(platformSendSerial);

    auto neopix = LOOKUP_PIN(NEOPIXEL);
    if (neopix && ZSPI::isValidMOSIPin(*neopix)) {
        auto num = getConfig(CFG_NUM_NEOPIXELS, 0);
        if (num) {
            uint8_t off[3 * num];
            memset(off, 0, sizeof(off));
            pxt::spiNeopixelSendBuffer(neopix, off, sizeof(off));
        }
    }

    /*
        if (*HF2_DBG_MAGIC_PTR == HF2_DBG_MAGIC_START) {
            *HF2_DBG_MAGIC_PTR = 0;
            // this will cause alignment fault at the first breakpoint
            globals[0] = (TValue)1;
        }
    */
}

int *getBootloaderConfigData() {
#ifdef SAMD51
    auto config_data = *(uint32_t *)(BOOTLOADER_END - 4 * 4);
    if (config_data && (config_data & 3) == 0 && config_data < BOOTLOADER_END) {
        auto p = (uint32_t *)config_data;
        if (p[0] == CFG_MAGIC0 && p[1] == CFG_MAGIC1)
            return (int *)p + 4;
    }
#endif
    return NULL;
}

} // namespace pxt

void cpu_clock_init() {}

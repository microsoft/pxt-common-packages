#include "pxt.h"

#include "SAMDTCTimer.h"
#include "SAMDTCCTimer.h"
#include "light.h"

namespace pxt {

#ifdef CODAL_JACDAC_WIRE_SERIAL
// TC3 is used by DAC on both D21 and D51
// TCC0 and TC4 is used by IR
// TCC0, TCC1, TC4 is used by PWM on CPX
#ifdef SAMD21
SAMDTCCTimer jacdacTimer(TCC2, TCC2_IRQn);
SAMDTCTimer lowTimer(TC5, TC5_IRQn);

LowLevelTimer *getJACDACTimer() {
    jacdacTimer.setIRQPriority(1);
    return &jacdacTimer;
}

#endif
#ifdef SAMD51
SAMDTCTimer jacdacTimer(TC0, TC0_IRQn);
SAMDTCTimer lowTimer(TC2, TC2_IRQn);

LowLevelTimer *getJACDACTimer() {
    jacdacTimer.setIRQPriority(1);
    return &jacdacTimer;
}
#endif
#endif // CODAL_JACDAC_WIRE_SERIAL

__attribute__((used)) CODAL_TIMER devTimer(lowTimer);

static void initRandomSeed() {
    int seed = 0xC0DA1;
    // TODO use TRNG
    seedRandom(seed);
}

void platformSendSerial(const char *data, int len) {}

#ifdef SAMD21
static void remapSwdPin(int pinCfg, int fallback) {
    int pinName = getConfig(pinCfg);
    if (pinName == PA30 || pinName == PA31) {
        if (getConfig(CFG_SWD_ENABLED, 0)) {
            linkPin(pinName, fallback);
        } else {
            PORT->Group[pinName / 32].PINCFG[pinName % 32].reg = (uint8_t)PORT_PINCFG_INEN;
        }
    }
}

static void initSwdPins() {
    remapSwdPin(CFG_PIN_NEOPIXEL, PIN(D0));
    remapSwdPin(CFG_PIN_RXLED, PIN(D1));
    remapSwdPin(CFG_PIN_SPEAKER_AMP, PIN(A2));
}
#else
static void initSwdPins() {}
#endif

void platform_init() {
    initSwdPins();
    initRandomSeed();
    setSendToUART(platformSendSerial);
    light::clear();

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

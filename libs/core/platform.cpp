#include "pxt.h"
#include "light.h"

namespace pxt {

CODAL_TIMER devTimer;

static void initRandomSeed() {
    int seed = 0xC0DA1;
    auto pinTemp = LOOKUP_PIN(TEMPERATURE);
    if (pinTemp)
        seed *= pinTemp->getAnalogValue();
    auto pinLight = LOOKUP_PIN(LIGHT);
    if (pinLight)
        seed *= pinLight->getAnalogValue();
    seedRandom(seed);
}

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
    remapSwdPin(CFG_PIN_SPEAKER_AMP, PIN(D2));
}

void platform_init() {
    initSwdPins();
    initRandomSeed();
    light::clear();

    if (*HF2_DBG_MAGIC_PTR == HF2_DBG_MAGIC_START) {
        *HF2_DBG_MAGIC_PTR = 0;
        // this will cause alignment fault at the first breakpoint
        globals[0] = (TValue)1;
    }
}

} // namespace pxt

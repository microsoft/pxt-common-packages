#include "pxt.h"

#include "SAMDTCTimer.h"
#include "SAMDTCCTimer.h"
#include "light.h"

namespace pxt {

struct TimerConfig {
    uint8_t id;
    uint8_t irq;
    uint8_t dmaovf;
    uint32_t addr;
};

#define DEF_TC(n)                                                                                  \
    { 0x10 + n, TC##n##_IRQn, TC##n##_DMAC_ID_OVF, (uint32_t)TC##n }
#ifdef SAMD21
#define DEF_TCC(n)                                                                                 \
    { 0x20 + n, TCC##n##_IRQn, TCC##n##_DMAC_ID_OVF, (uint32_t)TCC##n }
#else
#define DEF_TCC(n)                                                                                 \
    { 0x20 + n, TCC##n##_0_IRQn, TCC##n##_DMAC_ID_OVF, (uint32_t)TCC##n }
#endif

static const TimerConfig timers[] = {
#ifdef TC0
    DEF_TC(0),
#endif
#ifdef TC1
    DEF_TC(1),
#endif
#ifdef TC2
    DEF_TC(2),
#endif
#ifdef TC3
    DEF_TC(3),
#endif
#ifdef TC4
    DEF_TC(4),
#endif
#ifdef TC5
    DEF_TC(5),
#endif

#ifdef TCC0
    DEF_TCC(0),
#endif
#ifdef TCC1
    DEF_TCC(1),
#endif
#ifdef TCC2
    DEF_TCC(2),
#endif

    {0, 0, 0, 0}};

// Backlight:
// Kitronik: PA6 TC1 (ch 0)
// Adafruit: PA1 TC2 (ch 1)

// TC3 is used by DAC on both D21 and D51
// TCC0 and TC4 is used by IR
// TCC0, TCC1, TC4 is used by PWM on CPX

#ifdef SAMD21
#define DEF_TIMERS 0x15222021 // TC5 TCC2 TCC0 TCC1
#else
#define DEF_TIMERS 0x10111200 // TC0 TC1 TC2
#endif

static uint32_t usedTimers;
static int timerIdx(uint8_t id) {
    for (unsigned i = 0; timers[i].id; i++) {
        if (id == timers[i].id)
            return i;
    }
    return -1;
}
LowLevelTimer *allocateTimer() {
    uint32_t timersToUse = getConfig(CFG_TIMERS_TO_USE, DEF_TIMERS);
    uint8_t blTC = 0;
    // DAC hard-wired to TC3 right now
    uint8_t dacTC = 0x13;

    // if BL is on a known pin, don't use its PWM TC
    // this is a hack for legacy boards that don't have CFG_TIMERS_TO_USE
    auto blPin = PIN(DISPLAY_BL);
    if (blPin == PA01)
        blTC = 0x12;

    for (int shift = 24; shift >= 0; shift -= 8) {
        uint8_t tcId = (timersToUse >> shift) & 0xff;
        if (tcId == 0 || tcId == blTC || tcId == dacTC)
            continue;
        int idx = timerIdx(tcId);
        if (idx < 0 || (usedTimers & (1 << idx)))
            continue;
        LowLevelTimer *res;
        if (idx < 0x20) {
            Tc *tc = (Tc *)timers[idx].addr;
            if (tc->COUNT16.CTRLA.bit.ENABLE)
                continue;
            DMESG("allocate TC%d", tcId & 0xf);
            res = new SAMDTCTimer(tc, timers[idx].irq);
        } else {
            Tcc *tcc = (Tcc *)timers[idx].addr;
            if (tcc->CTRLA.bit.ENABLE)
                continue;
            DMESG("allocate TCC%d", tcId & 0xf);
            res = new SAMDTCCTimer(tcc, timers[idx].irq);
        }
        usedTimers |= 1 << idx;
        return res;
    }

    target_panic(PANIC_OUT_OF_TIMERS);
    return NULL;
}

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

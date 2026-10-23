#include "pxt.h"

#include "RP2040LowLevelTimer.h"

#include "hardware/pll.h"
#include "hardware/clocks.h"
#include "hardware/structs/rosc.h"

namespace pxt {

LowLevelTimer *allocateTimer() {
    // TODO: add config to low level timer
    return new RP2040LowLevelTimer();
}

static uint32_t hw_random(void) {
    uint8_t buf[16];
    for (unsigned i = 0; i < sizeof(buf); ++i) {
        buf[i] = 0;
        for (int j = 0; j < 8; ++j) {
            buf[i] <<= 1;
            if (rosc_hw->randombit)
                buf[i] |= 1;
        }
    }
    return hash_fnv1(buf, sizeof(buf));
}

static void initRandomSeed() {
    seedRandom(hw_random());
}

void deepSleep() {}

void platform_init() {
    initRandomSeed();

    // boards like the Tufty 2350 power the display and I2C peripherals from a switched rail
    auto pwr = LOOKUP_PIN(PWREN);
    if (pwr) {
        pwr->setDigitalValue(1);
        target_wait_us(50 * 1000);
    }
}

#if defined(PICO_RP2350) && PICO_RP2350
// only probe the 16MB flash window; higher XIP addresses map to PSRAM (CS1) or other regions
#define PXT_FLASH_PROBE_MAX_MB 16
#else
#define PXT_FLASH_PROBE_MAX_MB 64
#endif

int *getBootloaderConfigData() {
    static bool inited;
    static int *cached;

    if (!inited) {
        inited = 1;
        for (int i = 1; i <= PXT_FLASH_PROBE_MAX_MB; i *= 2) {
            uint32_t *p = (uint32_t *)(XIP_BASE + i * 1024 * 1024 - 4096);
            if (p[0] == CFG_MAGIC0 && p[1] == CFG_MAGIC1) {
                cached = (int *)p;
                break;
            }
        }
    }

    return cached;
}

} // namespace pxt

void cpu_clock_init() {
    // missing in Codal
}

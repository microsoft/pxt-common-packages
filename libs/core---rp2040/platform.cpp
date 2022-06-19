#include "pxt.h"

#include "RP2040LowLevelTimer.h"

#include "hardware/pll.h"
#include "hardware/clocks.h"

namespace pxt {

LowLevelTimer *allocateTimer() {
  // TODO: add config to low level timer
  return new RP2040LowLevelTimer();
}

static void initRandomSeed() {
  uint32_t f_rosc = frequency_count_khz(CLOCKS_FC0_SRC_VALUE_ROSC_CLKSRC);
  seedRandom(f_rosc);
}

void deepSleep() {

}

void platform_init() {
  initRandomSeed();

}

} // namespace pxt

void cpu_clock_init() {
    // missing in Codal
}

#include "pxt.h"

namespace pxt {

static void initRandomSeed() {
    int seed = 0xC0DA1;
    // TODO use TRNG
    seedRandom(seed);
}

void platformSendSerial(const char *data, int len) {
}

void platform_init() {
    initRandomSeed();
    setSendToUART(platformSendSerial);

/*
    if (*HF2_DBG_MAGIC_PTR == HF2_DBG_MAGIC_START) {
        *HF2_DBG_MAGIC_PTR = 0;
        // this will cause alignment fault at the first breakpoint
        globals[0] = (TValue)1;
    }
*/
}

}

void cpu_clock_init() {
    devTimer.init();
}

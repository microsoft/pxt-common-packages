#include "pxt.h"


static void NVIC_CopyToRAM() {
    uint32_t *vectors = (uint32_t *)SCB->VTOR;
    // Copy and switch to dynamic vectors if the first time called
    if (SCB->VTOR <= 0x1000000) {
        uint32_t *old_vectors = vectors;
        uint32_t tmp = (uint32_t)malloc(NVIC_NUM_VECTORS * 4 + 256);
        while (tmp & 0xff)
            tmp++;
        vectors = (uint32_t *)tmp;
        for (int i = 0; i < NVIC_NUM_VECTORS; i++) {
            vectors[i] = old_vectors[i];
        }
        SCB->VTOR = (uint32_t)vectors;
    }
}

void NVIC_Setup() {
    NVIC_SetPriority(EIC_IRQn, 0);
    NVIC_SetPriority(TC4_IRQn, 1);
    DMESG("set interrupt priority, TC4=%d EIC=%d", NVIC_GetPriority(TC4_IRQn),
          NVIC_GetPriority(EIC_IRQn));
}

static volatile bool periodicUsed;
static void *periodicData;
static void (*periodicCallback)(void *);
static void periodicIRQ() {
    TC3->COUNT16.INTFLAG.reg = TC_INTFLAG_MC(1);
    periodicCallback(periodicData);
}

void setPeriodicCallback(uint32_t usec, void *data, void (*callback)(void *)) {
    while (periodicUsed) {
        fiber_sleep(5);
    }

    if (usec > 8000)
        device.panic(42);

    periodicUsed = true;
    periodicData = data;
    periodicCallback = callback;

    NVIC_CopyToRAM();
    NVIC_DisableIRQ(TC3_IRQn);
    NVIC_SetPriority(TC3_IRQn, 1);

    struct tc_module ticker_module;
    struct tc_config config_tc;

    tc_get_config_defaults(&config_tc);
    config_tc.run_in_standby = true;
    config_tc.wave_generation = TC_WAVE_GENERATION_MATCH_FREQ;

    tc_init(&ticker_module, TC3, &config_tc);
    tc_enable(&ticker_module);
    tc_set_compare_value(&ticker_module, TC_COMPARE_CAPTURE_CHANNEL_0, 8 * usec - 1);

    TC3->COUNT16.COUNT.reg = 0;
    TC3->COUNT16.INTENSET.reg = TC_INTENSET_MC0;

    NVIC_SetVector(TC3_IRQn, (uint32_t)periodicIRQ);
    NVIC_EnableIRQ(TC3_IRQn);
}

void clearPeriodicCallback() {
    if (!periodicUsed) {
        device.panic(42);
    }

    NVIC_DisableIRQ(TC3_IRQn);
    TC3->COUNT16.INTENCLR.reg = TC_INTENCLR_MC0;
    NVIC_SetVector(TC3_IRQn, (uint32_t)TC3_Handler);
    periodicUsed = false;
}

void setTCC0(int enabled) {
    while (TCC0->STATUS.reg & TC_STATUS_SYNCBUSY)
        ;
    if (enabled)
        TCC0->CTRLA.reg |= TC_CTRLA_ENABLE;
    else
        TCC0->CTRLA.reg &= ~TC_CTRLA_ENABLE;
}

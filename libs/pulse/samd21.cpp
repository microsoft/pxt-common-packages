#include "pxt.h"


// static void NVIC_CopyToRAM() {
//     uint32_t *vectors = (uint32_t *)SCB->VTOR;
//     // Copy and switch to dynamic vectors if the first time called
//     if (SCB->VTOR <= 0x1000000) {
//         uint32_t *old_vectors = vectors;
//         uint32_t tmp = (uint32_t)xmalloc(NVIC_NUM_VECTORS * 4 + 256);
//         while (tmp & 0xff)
//             tmp++;
//         vectors = (uint32_t *)tmp;
//         for (int i = 0; i < NVIC_NUM_VECTORS; i++) {
//             vectors[i] = old_vectors[i];
//         }
//         SCB->VTOR = (uint32_t)vectors;
//     }
// }

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

void setTCC0(int enabled) {
    while (TCC0->STATUS.reg & TC_STATUS_SYNCBUSY)
        ;
    if (enabled)
        TCC0->CTRLA.reg |= TC_CTRLA_ENABLE;
    else
        TCC0->CTRLA.reg &= ~TC_CTRLA_ENABLE;
}

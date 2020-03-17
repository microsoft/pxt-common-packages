#include "CodalDmesg.h"

#if defined(NRF52840) || defined(NRF52832) || defined(NRF52833)
// NRF52_SERIES not defined here for some reason
#define JD_TIM_OVERHEAD 20
#define JD_WR_OVERHEAD 7
#elif defined(SAMD21)
#define JD_TIM_OVERHEAD 38
#define JD_WR_OVERHEAD 10
#elif defined(SAMD51)
#define JD_TIM_OVERHEAD 11
#define JD_WR_OVERHEAD 10
#elif defined(STM32F4)
#define JD_TIM_OVERHEAD 13
#define JD_WR_OVERHEAD 8
#endif

#ifndef JD_TIM_OVERHEAD
#define JD_TIM_OVERHEAD 12
#endif

#include "CodalDmesg.h"

#define JD_TX_QUEUE_SIZE 8

#if defined(NRF52_SERIES)
#define JD_WR_OVERHEAD 26 // TODO
#elif defined(SAMD21)
#define JD_TIM_OVERHEAD 29
#define JD_WR_OVERHEAD 34
#elif defined(SAMD51)
#define JD_TIM_OVERHEAD 13
#define JD_WR_OVERHEAD 0 // TODO
#elif defined(STM32F4)
#define JD_TIM_OVERHEAD 3
#define JD_WR_OVERHEAD -2
#endif

#ifndef JD_TIM_OVERHEAD
#define JD_TIM_OVERHEAD 5
#endif

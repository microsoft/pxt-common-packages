#include "pxt.h"
#include "STMLowLevelTimer.h"
#include "Accelerometer.h"
#include "light.h"

namespace pxt {

struct TimerConfig {
    uint8_t id;
    uint8_t irqn;
    TIM_TypeDef *addr;
};

#define TIM1_IRQn TIM1_CC_IRQn
#ifdef STM32F4
#define TIM9_IRQn TIM1_BRK_TIM9_IRQn
#define TIM10_IRQn TIM1_UP_TIM10_IRQn
#define TIM11_IRQn TIM1_TRG_COM_TIM11_IRQn
#endif

#define DEF_TIM(n)                                                                                 \
    { 0x10 + n, TIM##n##_IRQn, TIM##n }

static const TimerConfig timers[] = {
#ifdef TIM1
    DEF_TIM(1),
#endif
#ifdef TIM2
    DEF_TIM(2),
#endif
#ifdef TIM3
    DEF_TIM(3),
#endif
#ifdef TIM4
    DEF_TIM(4),
#endif
#ifdef TIM5
    DEF_TIM(5),
#endif
#ifdef TIM6
    DEF_TIM(6),
#endif
#ifdef TIM7
    DEF_TIM(7),
#endif
#ifdef TIM8
    DEF_TIM(8),
#endif
#ifdef TIM9
    DEF_TIM(9),
#endif
#ifdef TIM10
    DEF_TIM(10),
#endif
#ifdef TIM11
    DEF_TIM(11),
#endif
#ifdef TIM12
    DEF_TIM(12),
#endif
#ifdef TIM13
    DEF_TIM(13),
#endif
#ifdef TIM14
    DEF_TIM(14),
#endif
#ifdef TIM15
    DEF_TIM(15),
#endif
{0,0,0}
};

#ifdef STM32F1
#define DEF_TIMERS 0x14120000 // TIM4 TIM2
#else
#define DEF_TIMERS 0x15120000 // TIM5 TIM2
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
    for (int shift = 24; shift >= 0; shift -= 8) {
        uint8_t tcId = (timersToUse >> shift) & 0xff;
        int idx = timerIdx(tcId);
        if (idx < 0 || (usedTimers & (1 << idx)))
            continue;
        auto dev = timers[idx].addr;
        if (dev->CR1 & TIM_CR1_CEN)
            continue;
        usedTimers |= 1 << idx;
        DMESG("allocate TIM%d", tcId - 0x10);
        return new STMLowLevelTimer(dev, timers[idx].irqn);
    }

    target_panic(PANIC_OUT_OF_TIMERS);
    return NULL;
}


void initAccelRandom();
#ifdef STM32F4
extern "C" void apply_clock_init(RCC_OscInitTypeDef *oscInit, RCC_ClkInitTypeDef *clkConfig,
                                 uint32_t flashLatency) {

    int mhz = getConfig(CFG_CPU_MHZ, 84);

    if (mhz >= 216) {
        oscInit->PLL.PLLN = 432;
        oscInit->PLL.PLLP = RCC_PLLP_DIV2;
        oscInit->PLL.PLLQ = 9;
        flashLatency = FLASH_LATENCY_6;
    } else if (mhz >= 192) {
        oscInit->PLL.PLLN = 384;
        oscInit->PLL.PLLP = RCC_PLLP_DIV2;
        oscInit->PLL.PLLQ = 8;
        flashLatency = FLASH_LATENCY_6;
    } else if (mhz >= 168) {
        oscInit->PLL.PLLN = 336;
        oscInit->PLL.PLLP = RCC_PLLP_DIV2;
        oscInit->PLL.PLLQ = 7;
        flashLatency = FLASH_LATENCY_5;
    } else if (mhz >= 144) {
        oscInit->PLL.PLLN = 288;
        oscInit->PLL.PLLP = RCC_PLLP_DIV2;
        oscInit->PLL.PLLQ = 6;
        flashLatency = FLASH_LATENCY_5;
    } else if (mhz >= 108) {
        oscInit->PLL.PLLN = 432;
        oscInit->PLL.PLLP = RCC_PLLP_DIV4;
        oscInit->PLL.PLLQ = 9;
        flashLatency = FLASH_LATENCY_4;
    } else if (mhz >= 96) {
        oscInit->PLL.PLLN = 384;
        oscInit->PLL.PLLP = RCC_PLLP_DIV4;
        oscInit->PLL.PLLQ = 8;
        flashLatency = FLASH_LATENCY_3;
    } else if (mhz >= 84) {
        // this is the default from codal
        oscInit->PLL.PLLN = 336;
        oscInit->PLL.PLLP = RCC_PLLP_DIV4;
        oscInit->PLL.PLLQ = 7;
        flashLatency = FLASH_LATENCY_2;
    } else {
        target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);
    }

    DMESG("CPU clock: %dMHz -> %dMHz", mhz,
          oscInit->PLL.PLLN / (oscInit->PLL.PLLP == RCC_PLLP_DIV4 ? 4 : 2));

    if (mhz > 108) {
        clkConfig->APB1CLKDivider = RCC_HCLK_DIV4;
        clkConfig->APB2CLKDivider = RCC_HCLK_DIV2;
    } else {
        clkConfig->APB1CLKDivider = RCC_HCLK_DIV2;
        clkConfig->APB2CLKDivider = RCC_HCLK_DIV1;
    }

    HAL_RCC_OscConfig(oscInit);
    HAL_RCC_ClockConfig(clkConfig, flashLatency);
}
#endif

// Disable seeding random from accelerometer. We now store random
// seed in internal flash, so it's different on every reset, and
// accelerometer sometimes have bugs, so better not enable them unless
// requested.
static void initRandomSeed() {
#if 0
    if (getConfig(CFG_ACCELEROMETER_TYPE, -1) != -1) {
        initAccelRandom();
    }
#endif
}

static void set_if_present(int cfg, int val) {
    auto snd = pxt::lookupPinCfg(cfg);
    if (snd)
        snd->setDigitalValue(val);
}

//%
void deepSleep() {
    // this in particular puts accelerometer to sleep, which the bootloader
    // doesn't do
    CodalComponent::setAllSleep(true);

#ifdef STM32F4
    // ask bootloader to do the deep sleeping
    QUICK_BOOT(1);
    RTC->BKP1R = 0x10b37889;
    NVIC_SystemReset();
#endif
}

void platformSendSerial(const char *data, int len) {
    /*
    if (!serial) {
        serial = new codal::_mbed::Serial(USBTX, NC);
        serial->baud(9600);
    }
    serial->send((uint8_t*)data, len);
    */
}

void platform_init() {
    initRandomSeed();
    setSendToUART(platformSendSerial);
    light::clear();

    // make sure sound doesn't draw power before enabled
    set_if_present(CFG_PIN_JACK_SND, 0);
    set_if_present(CFG_PIN_JACK_HPEN, 0);
    set_if_present(CFG_PIN_JACK_BZEN, 1);

    /*
        if (*HF2_DBG_MAGIC_PTR == HF2_DBG_MAGIC_START) {
            *HF2_DBG_MAGIC_PTR = 0;
            // this will cause alignment fault at the first breakpoint
            globals[0] = (TValue)1;
        }
    */
}

int *getBootloaderConfigData() {
#ifdef STM32F4
    auto config_data = (uint32_t)(UF2_BINFO->configValues);
    if (config_data && (config_data & 3) == 0) {
        auto p = (uint32_t *)config_data - 4;
        if (p[0] == CFG_MAGIC0 && p[1] == CFG_MAGIC1)
            return (int *)p + 4;
    }
#endif

    return NULL;
}

#define STM32_UUID ((uint32_t *)0x1FFF7A10)

static void writeHex(char *buf, uint32_t n) {
    int i = 0;
    int sh = 28;
    while (sh >= 0) {
        int d = (n >> sh) & 0xf;
        buf[i++] = d > 9 ? 'A' + d - 10 : '0' + d;
        sh -= 4;
    }
    buf[i] = 0;
}

void platform_usb_init() {
#if CONFIG_ENABLED(DEVICE_USB)
    static char serial_number[25];

    writeHex(serial_number, STM32_UUID[0]);
    writeHex(serial_number + 8, STM32_UUID[1]);
    writeHex(serial_number + 16, STM32_UUID[2]);

    usb.stringDescriptors[2] = serial_number;
#endif
}

} // namespace pxt

void cpu_clock_init() {}

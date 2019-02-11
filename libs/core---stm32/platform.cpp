#include "pxt.h"
#include "STMLowLevelTimer.h"
#include "Accelerometer.h"
#include "light.h"

namespace pxt {

STMLowLevelTimer lowTimer(TIM5, TIM5_IRQn);
CODAL_TIMER devTimer(lowTimer);

void initAccelRandom();

static void initRandomSeed() {
    if (getConfig(CFG_ACCELEROMETER_TYPE, -1) != -1) {
        initAccelRandom();
    }
}

void setScreenSleep(bool sleepOn);

static void set_if_present(int cfg, int val) {
    auto snd = pxt::lookupPinCfg(cfg);
    if (snd)
        snd->setDigitalValue(val);
}

//%
void deepsleep() {
    // this in particular puts accelerometer to sleep, which the bootloader
    // doesn't do
    CodalComponent::setAllSleep(true);

    // ask bootloader to do the deep sleeping
    QUICK_BOOT(1);
    RTC->BKP1R = 0x10b37889;
    NVIC_SystemReset();
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
    auto config_data = (uint32_t)(UF2_BINFO->configValues);
    if (config_data && (config_data & 3) == 0) {
        auto p = (uint32_t *)config_data - 4;
        if (p[0] == CFG_MAGIC0 && p[1] == CFG_MAGIC1)
            return (int *)p + 4;
    }

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

#include "pxt.h"
#include "STMLowLevelTimer.h"
#include "Accelerometer.h"

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

//%
void deepsleep() {
    setScreenSleep(true);

    auto btn = LOOKUP_PIN(BTN_MENU);
    btn->eventOn(DEVICE_PIN_EVENT_ON_EDGE);

    auto led0 = LOOKUP_PIN(LED1);
    if (led0)
        led0->setDigitalValue(0);
    
    auto led = LOOKUP_PIN(LED);
    if (led)
        led->setDigitalValue(0);

    lowTimer.disableIRQ();

    auto longPress = 1000;

    // waiting for long-press
    for (;;) {
        DMESG("deep sleep");
        target_deepsleep();

        int numSleep = 0;
        for (;;) {
            codal::system_timer_wait_ms(5);
            numSleep += 5;
            if (btn->getDigitalValue() == 1)
                break;
            // indicate to the user they have pressed long enough
            if (numSleep > longPress) {
                auto bl = LOOKUP_PIN(DISPLAY_BL);
                if (bl)
                    bl->setDigitalValue(1);
            }
        }
        // A pressed for longer than Nms
        if (numSleep > longPress)
            break;
    }

    lowTimer.enableIRQ();

    DMESG("end deep sleep");

    setScreenSleep(false);
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

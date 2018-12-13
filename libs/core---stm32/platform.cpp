#include "pxt.h"

namespace pxt {

static void initRandomSeed() {
    int seed = 0xC0DA1;
    /*
    auto pinTemp = LOOKUP_PIN(TEMPERATURE);
    if (pinTemp)
        seed *= pinTemp->getAnalogValue();
    auto pinLight = LOOKUP_PIN(LIGHT);
    if (pinLight)
        seed *= pinLight->getAnalogValue();
    */
    seedRandom(seed);
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


// TODO extract these from uf2_info()?
static const char *string_descriptors[3];

void platform_usb_init() {
    static char serial[12];
    itoa(target_get_serial() & 0x7fffffff, serial);

    auto dev = (char*)app_alloc(strlen(UF2_BINFO->device) + 10);
    strcpy(dev, UF2_BINFO->device);
    strcat(dev, " (app)");

    string_descriptors[0] = UF2_BINFO->manufacturer;
    string_descriptors[1] = dev;
    string_descriptors[2] = serial;
    usb.stringDescriptors = string_descriptors;
}

}

void cpu_clock_init() {
    devTimer.init();
}

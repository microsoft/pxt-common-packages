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

void sendSerial(const char *data, int len) {
    /*
    if (!serial) {
        serial = new codal::_mbed::Serial(USBTX, NC);
        serial->baud(9600);
    }
    serial->send((uint8_t*)data, len);
    */
}

extern "C" void drawPanic(int code)
{
    // TODO
}


extern "C" void target_init()
{
    initRandomSeed();
}

void screen_init() {

}

}


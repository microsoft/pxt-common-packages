#include "pxt.h"

namespace pxt {
static DevicePin **pinPtrs;
static uint8_t numPinPtrs;
static uint8_t pinPos[DEV_NUM_PINS];

//% expose
DevicePin *getPin(int id) {

    id &= CFG_PIN_NAME_MSK;

    if (id >= DEV_NUM_PINS)
        target_panic(PANIC_NO_SUCH_PIN);

    int ptr = pinPos[id];
    if (ptr == 0) {
        pinPtrs = (DevicePin **)realloc(pinPtrs, (numPinPtrs + 1) * sizeof(void *));
        // GCTODO
        pinPtrs[numPinPtrs++] =
            new DevicePin(id);
        ptr = numPinPtrs;
        pinPos[id] = ptr;
    }
    return pinPtrs[ptr - 1];
}

//% expose
DevicePin *getPinCfg(int key) {
    int p = getConfig(key, -1);
    if (p == -1)
        DMESG("no pin cfg: %d", key);
    return getPin(p);
}

void linkPin(int from, int to) {
    if (from < 0 || from >= DEV_NUM_PINS)
        target_panic(PANIC_NO_SUCH_PIN);
    getPin(to);
    pinPos[from] = pinPos[to];
}

//% expose
DevicePin *lookupPin(int pinName) {
    if (pinName < 0 || pinName == 0xff)
        return NULL;
    pinName &= CFG_PIN_NAME_MSK;
    return getPin(pinName);
}

//% expose
DevicePin *lookupPinCfg(int key) {
    return lookupPin(getConfig(key));
}

} // namespace pxt

namespace pins {
/**
* Get a pin by configuration id (DAL.CFG_PIN...)
*/
//%
DigitalInOutPin pinByCfg(int key) {
    return pxt::lookupPinCfg(key);
}

/**
 * Create a new zero-initialized buffer.
 * @param size number of bytes in the buffer
 */
//%
Buffer createBuffer(int size) {
    return mkBuffer(NULL, size);
}

} // namespace pins

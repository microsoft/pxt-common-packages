#include "pxt.h"

namespace pxt {
static DevicePin **pinPtrs;
static uint8_t numPinPtrs;
static uint8_t pinPos[DEV_NUM_PINS];

//%
DevicePin *getPin(int id) {
    if (id < 0 || id >= DEV_NUM_PINS)
        target_panic(PANIC_NO_SUCH_PIN);

    // we could use lookupComponent() here - it would be slightly slower

    int ptr = pinPos[id];
    if (ptr == 0) {
        pinPtrs = (DevicePin **)realloc(pinPtrs, (numPinPtrs + 1) * sizeof(void *));
        bool isAnalog = IS_ANALOG_PIN(id);
        // GCTODO
        pinPtrs[numPinPtrs++] =
            new DevicePin(DEVICE_ID_IO_P0 + id, (PinName)id,
                          isAnalog ? PIN_CAPABILITY_AD : PIN_CAPABILITY_DIGITAL);
        ptr = numPinPtrs;
        pinPos[id] = ptr;
    }
    return pinPtrs[ptr - 1];
}

//%
DevicePin *getPinCfg(int key) {
    return getPin(getConfig(key));
}

void linkPin(int from, int to) {
    if (from < 0 || from >= DEV_NUM_PINS)
        target_panic(PANIC_NO_SUCH_PIN);
    getPin(to);
    pinPos[from] = pinPos[to];
}

//%
DevicePin *lookupPin(int pinName) {
    if (pinName < 0 || pinName == 0xff)
        return NULL;
    return getPin(pinName);
}

CodalComponent *lookupComponent(int id) {
    for (int i = 0; i < DEVICE_COMPONENT_COUNT; ++i) {
        if (CodalComponent::components[i] && CodalComponent::components[i]->id == id)
            return CodalComponent::components[i];
    }
    return NULL;
}

} // namespace pxt

namespace pins {
/**
* Get a pin by configuration id (DAL.CFG_PIN...)
*/
//%
DigitalInOutPin pinByCfg(int key) {
    return pxt::getPinCfg(key);
}

/**
 * Create a new zero-initialized buffer.
 * @param size number of bytes in the buffer
 */
//%
Buffer createBuffer(int size) {
    return mkBuffer(NULL, size);
}

/**
 * Get the duration of the last pulse in microseconds. This function should be called from a
 * ``onPulsed`` handler.
 */
//% help=pins/pulse-duration blockGap=8
//% blockId=pins_pulse_duration block="pulse duration (µs)"
//% weight=19
int pulseDuration() {
    return pxt::lastEvent.timestamp;
}
} // namespace pins

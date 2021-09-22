#pragma once

#define DEVICE_PIN_EVT_RISE 2
#define DEVICE_PIN_EVT_FALL 3
#define DEVICE_PIN_EVT_PULSE_HI 4
#define DEVICE_PIN_EVT_PULSE_LO 5

#define DEVICE_PIN_EVENT_NONE 0
#define DEVICE_PIN_EVENT_ON_EDGE 1
#define DEVICE_PIN_EVENT_ON_PULSE 2
#define DEVICE_PIN_EVENT_ON_TOUCH 3

namespace pxt {
enum class PullMode : uint8_t { None = 0, Down, Up };

class ZPin : RefObject {
    uint8_t gpio_num;
    uint8_t status;
    PullMode pullMode;

  public:
    uint8_t id;

    ZPin(int gpio_num);
    void disconnect();
    int setDigitalValue(int value);
    int getDigitalValue();
    int setPull(PullMode pull);
    int getDigitalValue(PullMode pull);
    int eventOn(int eventType);
};

static inline ZPin *asZPin(TValue v) {
    if (!isPointer(v))
        failedCast(v);
    auto vt = getVTable((RefObject *)v);
    if (vt->classNo != BuiltInType::ZPin)
        failedCast(v);
    return (ZPin *)v;
}

#define asDigitalInOutPin pxt::asZPin
#define asAnalogInOutPin pxt::asZPin
#define asAnalogInPin pxt::asZPin
#define asAnalogOutPin pxt::asZPin
#define asPwmPin pxt::asZPin
#define asPwmOnlyPin pxt::asZPin

static inline int64_t system_timer_current_time_us() {
    return esp_timer_get_time();
}

} // namespace pxt
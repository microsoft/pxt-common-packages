#include "pxt.h"

#include "esp_system.h"
#include "esp_log.h"
#include "driver/gpio.h"

#define IO_STATUS_DIGITAL_IN 0x0001    // Pin is configured as a digital input, with no pull up.
#define IO_STATUS_DIGITAL_OUT 0x0002   // Pin is configured as a digital output
#define IO_STATUS_ANALOG_IN 0x0004     // Pin is Analog in
#define IO_STATUS_ANALOG_OUT 0x0008    // Pin is Analog out
#define IO_STATUS_TOUCH_IN 0x0010      // Pin is a makey-makey style touch sensor
#define IO_STATUS_EVENT_ON_EDGE 0x0020 // Pin will generate events on pin change
#define IO_STATUS_EVENT_PULSE_ON_EDGE 0x0040 // Pin will generate events on pin change
#define IO_STATUS_INTERRUPT_ON_EDGE 0x0080   // Pin will generate events on pin change

namespace pxt {

PXT_EXT_VTABLE(ZPin);

ZPin::ZPin(int gpio_num) : RefObject(&ZPin_vtable) {
    this->gpio_num = gpio_num;
    this->status = 0;
    this->pullMode = PullMode::None;
    this->id = 100 + gpio_num;
}

void ZPin::disconnect() {
    gpio_reset_pin((gpio_num_t)gpio_num);
    status = 0;
}

int ZPin::setDigitalValue(int value) {
    // Write the value, before setting as output - this way the pin state update will be atomic
    gpio_set_level((gpio_num_t)gpio_num, value);

    // Move into a Digital output state if necessary.
    if (!(status & IO_STATUS_DIGITAL_OUT)) {
        disconnect();

        gpio_config_t cfg;
        memset(&cfg, 0, sizeof(cfg));
        cfg.pin_bit_mask = 1ULL << gpio_num;
        cfg.mode = GPIO_MODE_OUTPUT;
        gpio_config(&cfg);

        status |= IO_STATUS_DIGITAL_OUT;
    }

    return 0;
}

int ZPin::getDigitalValue() {
    if (!(status & (IO_STATUS_DIGITAL_IN | IO_STATUS_EVENT_ON_EDGE | IO_STATUS_EVENT_PULSE_ON_EDGE |
                    IO_STATUS_INTERRUPT_ON_EDGE))) {
        disconnect();
        gpio_config_t cfg;
        memset(&cfg, 0, sizeof(cfg));
        cfg.pin_bit_mask = 1ULL << gpio_num;
        cfg.mode = GPIO_MODE_INPUT;
        switch (pullMode) {
        case PullMode::Down:
            cfg.pull_down_en = GPIO_PULLDOWN_ENABLE;
            break;
        case PullMode::Up:
            cfg.pull_up_en = GPIO_PULLUP_ENABLE;
            break;
        case PullMode::None:
            break;
        }
        gpio_config(&cfg);

        status |= IO_STATUS_DIGITAL_IN;
    }

    return gpio_get_level((gpio_num_t)gpio_num);
}

int ZPin::setPull(PullMode pull) {
    if (pull != pullMode) {
        status = 0;
        pullMode = pull;
        getDigitalValue();
    }
    return 0;
}

int ZPin::getDigitalValue(PullMode pull) {
    setPull(pull);
    return getDigitalValue();
}

int ZPin::eventOn(int eventType) {
    switch (eventType) {
    case DEVICE_PIN_EVENT_ON_EDGE:
    case DEVICE_PIN_EVENT_ON_PULSE:
        // enableRiseFallEvents(eventType);
        break;

    case DEVICE_PIN_EVENT_ON_TOUCH:
        // isTouched();
        break;

    case DEVICE_PIN_EVENT_NONE:
        // disableEvents();
        break;

    default:
        return -1;
    }

    return 0;
}

uint32_t readButtonMultiplexer(int bits) {
    return 0;
}

} // namespace pxt
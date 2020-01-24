#include "pxt.h"

namespace pxt {

class PressureButton : public codal::Button {
  public:
    PressureButton(Pin &pin, uint16_t id,
                   ButtonEventConfiguration eventConfiguration = DEVICE_BUTTON_ALL_EVENTS,
                   ButtonPolarity polarity = ACTIVE_LOW, PullMode mode = PullMode::None)
        : Button(pin, id, eventConfiguration, polarity, mode) {}

    virtual int pressureLevel() { return isPressed() ? 512 : 0; }
};

static const int INTERNAL_KEY_UP = 2050;
static const int INTERNAL_KEY_DOWN = 2051;

static void waitABit() {
    //for (int i = 0; i < 10; ++i)
    //    asm volatile("nop");
}

class ButtonMultiplexer : public CodalComponent {
  public:
    Pin &latch;
    Pin &clock;
    Pin &data;
    uint32_t state;
    uint32_t invMask;
    uint16_t buttonIdPerBit[8];

    ButtonMultiplexer(uint16_t id)
        : latch(*LOOKUP_PIN(BTNMX_LATCH)), clock(*LOOKUP_PIN(BTNMX_CLOCK)),
          data(*LOOKUP_PIN(BTNMX_DATA)) {
        this->id = id;
        this->status |= DEVICE_COMPONENT_STATUS_SYSTEM_TICK;

        state = 0;
        invMask = 0;

        memset(buttonIdPerBit, 0, sizeof(buttonIdPerBit));

        data.getDigitalValue(PullMode::Down);
        latch.setDigitalValue(1);
        clock.setDigitalValue(1);
    }

    bool isButtonPressed(int id) {
        for (int i = 0; i < 8; ++i) {
            if (buttonIdPerBit[i] == id)
                return (state & (1 << i)) != 0;
        }
        return false;
    }

    uint32_t readBits(int bits) {
        latch.setDigitalValue(0);
        waitABit();
        latch.setDigitalValue(1);
        waitABit();

        uint32_t state = 0;
        for (int i = 0; i < bits; i++) {
            state <<= 1;
            if (data.getDigitalValue(PullMode::Down))
                state |= 1;

            clock.setDigitalValue(0);
            waitABit();
            clock.setDigitalValue(1);
            waitABit();
        }

        return state;
    }

    virtual void periodicCallback() override {
        uint32_t newState = readBits(8);
        newState ^= invMask;
        if (newState == state)
            return;

        for (int i = 0; i < 8; ++i) {
            uint32_t mask = 1 << i;
            if (!buttonIdPerBit[i])
                continue;
            int ev = 0;
            if (!(state & mask) && (newState & mask))
                ev = INTERNAL_KEY_DOWN;
            else if ((state & mask) && !(newState & mask))
                ev = INTERNAL_KEY_UP;
            if (ev) {
                Event(ev, buttonIdPerBit[i]);
                Event(ev, 0); // any key
            }
        }

        state = newState;
    }
};

static ButtonMultiplexer *btnMultiplexer;
ButtonMultiplexer *getMultiplexer() {
    if (!btnMultiplexer)
        btnMultiplexer = new ButtonMultiplexer(DEVICE_ID_FIRST_BUTTON);
    return btnMultiplexer;
}

struct AnalogCache {
    AnalogCache *next;
    Pin *pin;
    uint32_t lastMeasureMS;
    uint16_t lastMeasure;
    AnalogCache(Pin *pin) : pin(pin) {
        next = NULL;
        lastMeasureMS = 0;
        lastMeasure = pin->getAnalogValue();
    }
    uint16_t read();
};

uint16_t AnalogCache::read() {
    uint32_t now = current_time_ms();
    if (now - lastMeasureMS < 50)
        return lastMeasure;
    lastMeasureMS = now;
    lastMeasure = pin->getAnalogValue();
    return lastMeasure;
}

static AnalogCache *analogCache;

class AnalogButton : public PressureButton {
  public:
    AnalogCache *cache;
    int16_t threshold;
    bool state;

    AnalogButton(AnalogCache *cache, uint16_t id, int threshold)
        : PressureButton(*cache->pin, id), cache(cache), threshold(threshold), state(false) {}

  protected:
    virtual int pressureLevel() override {
        int v = cache->read() - 512;
        if (threshold < 0)
            v = -v;
        int vmin = getConfig(CFG_ANALOG_JOYSTICK_MIN, 50);
        int vmax = getConfig(CFG_ANALOG_JOYSTICK_MAX, 500);
        v = (v - vmin) * 512 / (vmax - vmin);
        if (v < 0)
            v = 0;
        if (v > 512)
            v = 512;
        return v;
    }

    virtual int buttonActive() override {
        int v = cache->read() - 512;
        int thr = threshold;

        if (thr < 0) {
            v = -v;
            thr = -thr;
        }

        if (v > thr)
            state = true;
        else if (state && v > thr * 3 / 4)
            state = true;
        else
            state = false;

        return state;
    }
};

AnalogCache *lookupAnalogCache(Pin *pin) {
    for (auto c = analogCache; c; c = c->next)
        if (c->pin == pin)
            return c;
    auto c = new AnalogCache(pin);
    c->next = analogCache;
    analogCache = c;
    return c;
}

//% expose
int pressureLevelByButtonId(int btnId, int codalId) {
    if (codalId <= 0)
        codalId = DEVICE_ID_FIRST_BUTTON + btnId;
    auto btn = (PressureButton *)lookupComponent(codalId);
    if (!btn) {
        if (btnMultiplexer)
            return btnMultiplexer->isButtonPressed(btnId) ? 512 : 0;
        return 0;
    }
    return btn->pressureLevel();
}

static void sendBtnDown(Event ev) {
    Event(INTERNAL_KEY_DOWN, ev.source - DEVICE_ID_FIRST_BUTTON);
}

static void sendBtnUp(Event ev) {
    Event(INTERNAL_KEY_UP, ev.source - DEVICE_ID_FIRST_BUTTON);
}

//% expose
void setupButton(int buttonId, int key) {
    int pin = getConfig(key);
    if (pin == -1)
        target_panic(PANIC_NO_SUCH_CONFIG);

    unsigned highflags = (unsigned)pin >> 16;
    int flags = BUTTON_ACTIVE_LOW_PULL_UP;
    if (highflags & 0xff)
        flags = highflags & 0xff;

    pin &= 0xffff;

    auto cpid = DEVICE_ID_FIRST_BUTTON + buttonId;
    auto btn = (PressureButton *)lookupComponent(cpid);
    if (btn == NULL) {
        if (1050 <= pin && pin < 1058) {
            pin -= 50;
            getMultiplexer()->invMask |= 1 << (pin - 1000);
        }
        if (1000 <= pin && pin < 1008) {
            getMultiplexer()->buttonIdPerBit[pin - 1000] = buttonId;
            return;
        }

        if (1100 <= pin && pin < 1300) {
            pin -= 1100;
            int thr = getConfig(CFG_ANALOG_BUTTON_THRESHOLD, 300);
            if (pin >= 100) {
                thr = -thr;
                pin -= 100;
            }
            btn = new AnalogButton(lookupAnalogCache(lookupPin(pin)), cpid, thr);
        } else {
            auto pull = PullMode::None;
            if ((flags & 0xf0) == 0x10)
                pull = PullMode::Down;
            else if ((flags & 0xf0) == 0x20)
                pull = PullMode::Up;
            else if ((flags & 0xf0) == 0x30)
                pull = PullMode::None;
            else
                oops(3);
            btn = new PressureButton(*lookupPin(pin), cpid, DEVICE_BUTTON_ALL_EVENTS,
                                     (ButtonPolarity)(flags & 0xf), pull);
        }
        EventModel::defaultEventBus->listen(btn->id, DEVICE_BUTTON_EVT_DOWN, sendBtnDown);
        EventModel::defaultEventBus->listen(btn->id, DEVICE_BUTTON_EVT_UP, sendBtnUp);
    }
}

//% expose
uint32_t readButtonMultiplexer(int bits) {
    if (!LOOKUP_PIN(BTNMX_CLOCK))
        return 0;
    return getMultiplexer()->readBits(bits);
}
} // namespace pxt

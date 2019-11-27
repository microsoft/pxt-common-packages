#include "pxt.h"

/*

These button events need CODAL work.

    // % block="double click"
    DoubleClick = DEVICE_BUTTON_EVT_DOUBLE_CLICK,

    // % block="hold"
    Hold = DEVICE_BUTTON_EVT_HOLD

*/

/**
 * User interaction on buttons
 */
enum class ButtonEvent {
    //% block="click"
    Click = DEVICE_BUTTON_EVT_CLICK,
    //% block="long click"
    LongClick = DEVICE_BUTTON_EVT_LONG_CLICK,
    //% block="up"
    Up = DEVICE_BUTTON_EVT_UP,
    //% block="down"
    Down = DEVICE_BUTTON_EVT_DOWN
};

namespace pxt {

class PressureButton : public codal::Button {
  public:
    PressureButton(Pin &pin, uint16_t id,
                   ButtonEventConfiguration eventConfiguration = DEVICE_BUTTON_ALL_EVENTS,
                   ButtonPolarity polarity = ACTIVE_LOW, PullMode mode = PullMode::None)
        : Button(pin, id, eventConfiguration, polarity, mode) {}

    virtual int pressureLevel() { return isPressed() ? 512 : 0; }
};

#ifdef PXT_74HC165
static void waitABit() {
    for (int i = 0; i < 10; ++i)
        asm volatile("nop");
}
class MultiplexedButton;
class ButtonMultiplexer : public CodalComponent {
  public:
    Pin &latch;
    Pin &clock;
    Pin &data;
    uint32_t state;
    MultiplexedButton *createButton(uint16_t id, uint8_t shift);
    ButtonMultiplexer(uint16_t id)
        : latch(*LOOKUP_PIN(BTNMX_LATCH)), clock(*LOOKUP_PIN(BTNMX_CLOCK)),
          data(*LOOKUP_PIN(BTNMX_DATA)) {
        this->state = 0;
        this->id = id;
        this->status |= DEVICE_COMPONENT_STATUS_SYSTEM_TICK;
    }

    virtual void periodicCallback() override {
        latch.setDigitalValue(0);
        waitABit();
        latch.setDigitalValue(1);
        waitABit();

        state = 0;

        for (int i = 0; i < 8; i++) {
            state <<= 1;
            if (data.getDigitalValue())
                state |= 1;
            clock.setDigitalValue(1);
            waitABit();
            clock.setDigitalValue(0);
            waitABit();
        }
    }
};
class MultiplexedButton : public PressureButton {
  public:
    ButtonMultiplexer *parent;
    uint8_t shift;
    MultiplexedButton(uint16_t id, uint8_t shift, ButtonMultiplexer *parent)
        : PressureButton(parent->data, id), parent(parent), shift(shift) {}

  protected:
    virtual int buttonActive() { return (parent->state & (1 << shift)) != 0; }
};

MultiplexedButton *ButtonMultiplexer::createButton(uint16_t id, uint8_t shift) {
    return new MultiplexedButton(id, shift, this);
}

static ButtonMultiplexer *buttonMultiplexer;
#endif

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
    (void)btnId;
    auto btn = (PressureButton *)lookupComponent(codalId);
    if (!btn)
        return 0;
    return btn->pressureLevel();
}

//%
PressureButton *getButtonByPin(int pin, int flags) {
    pin &= 0xffff;

    unsigned highflags = (unsigned)pin >> 16;
    if (highflags & 0xff)
        flags = highflags & 0xff;

    auto cpid = DEVICE_ID_FIRST_BUTTON + pin;
    auto btn = (PressureButton *)lookupComponent(cpid);
    if (btn == NULL) {
#ifdef PXT_74HC165
        if (1000 <= pin && pin < 1100) {
            if (!buttonMultiplexer)
                buttonMultiplexer = new ButtonMultiplexer(DEVICE_ID_FIRST_BUTTON);
            return buttonMultiplexer->createButton(cpid, pin - 1000);
        }
#endif
        if (1100 <= pin && pin < 1300) {
            pin -= 1100;
            int thr = getConfig(CFG_ANALOG_BUTTON_THRESHOLD, 300);
            if (pin >= 100) {
                thr = -thr;
                pin -= 100;
            }
            return new AnalogButton(lookupAnalogCache(lookupPin(pin)), cpid, thr);
        }

        auto pull = PullMode::None;
        if ((flags & 0xf0) == 0x10)
            pull = PullMode::Down;
        else if ((flags & 0xf0) == 0x20)
            pull = PullMode::Up;
        else if ((flags & 0xf0) == 0x30)
            pull = PullMode::None;
        else
            oops(3);
        // GCTODO
        btn = new PressureButton(*lookupPin(pin), cpid, DEVICE_BUTTON_ALL_EVENTS,
                                 (ButtonPolarity)(flags & 0xf), pull);
    }
    return btn;
}

//%
PressureButton *getButtonByPinCfg(int key, int flags) {
    int pin = getConfig(key);
    if (pin == -1)
        target_panic(PANIC_NO_SUCH_CONFIG);
    return getButtonByPin(pin, flags);
}

MultiButton *getMultiButton(int id, int pinA, int pinB, int flags) {
    auto btn = (MultiButton *)lookupComponent(id);
    if (btn == NULL) {
        auto bA = getButtonByPin(pinA, flags);
        auto bB = getButtonByPin(pinB, flags);
        // GCTODO
        btn = new codal::MultiButton(bA->id, bB->id, id);

        // A user has registered to receive events from the buttonAB multibutton.
        // Disable click events from being generated by ButtonA and ButtonB, and defer the
        // control of this to the multibutton handler.
        //
        // This way, buttons look independent unless a buttonAB is requested, at which
        // point button A+B clicks can be correclty handled without breaking
        // causal ordering.
        bA->setEventConfiguration(DEVICE_BUTTON_SIMPLE_EVENTS);
        bB->setEventConfiguration(DEVICE_BUTTON_SIMPLE_EVENTS);
        btn->setEventConfiguration(DEVICE_BUTTON_ALL_EVENTS);
    }
    return btn;
}

// This is for A, B, and AB
//%
AbstractButton *getButton(int id) {
    int pa = getConfig(CFG_PIN_BTN_A);
    int pb = getConfig(CFG_PIN_BTN_B);
    int flags = getConfig(CFG_DEFAULT_BUTTON_MODE, BUTTON_ACTIVE_LOW_PULL_UP);
    if (id == 0)
        return getButtonByPin(pa, flags);
    else if (id == 1)
        return getButtonByPin(pb, flags);
    else if (id == 2)
        return getMultiButton(DEVICE_ID_BUTTON_AB, pa, pb, flags);
    else {
        target_panic(PANIC_INVALID_ARGUMENT);
        return NULL;
    }
}

} // namespace pxt

namespace DigitalInOutPinMethods {

/**
 * Get the push button (connected to GND) for given pin
 */
//%
Button_ pushButton(DigitalInOutPin pin) {
    return pxt::getButtonByPin(pin->name, BUTTON_ACTIVE_LOW_PULL_UP);
}

} // namespace DigitalInOutPinMethods

//% noRefCounting fixedInstances
namespace ButtonMethods {
/**
 * Do something when a button (`A`, `B` or both `A` + `B`) is clicked, double clicked, etc...
 * @param button the button that needs to be clicked or used
 * @param event the kind of button gesture that needs to be detected
 * @param body code to run when the event is raised
 */
//% help=input/button/on-event
//% blockId=buttonEvent block="on %button|%event"
//% blockNamespace=input
//% button.fieldEditor="gridpicker"
//% button.fieldOptions.width=220
//% button.fieldOptions.columns=3
//% weight=96 blockGap=12
//% trackArgs=0
void onEvent(Button_ button, ButtonEvent ev, Action body) {
    registerWithDal(button->id, (int)ev, body);
}

/**
 * Check if a button is pressed or not.
 * @param button the button to query the request
 */
//% help=input/button/is-pressed
//% block="%button|is pressed"
//% blockId=buttonIsPressed
//% blockNamespace=input
//% button.fieldEditor="gridpicker"
//% button.fieldOptions.width=220
//% button.fieldOptions.columns=3
//% weight=50 blockGap=8
//% trackArgs=0
bool isPressed(Button_ button) {
    return button->isPressed();
}

/**
 * See if the button was pressed again since the last time you checked.
 * @param button the button to query the request
 */
//% help=input/button/was-pressed
//% block="%button|was pressed"
//% blockId=buttonWasPressed
//% blockNamespace=input
//% button.fieldEditor="gridpicker"
//% button.fieldOptions.width=220
//% button.fieldOptions.columns=3
//% group="More" weight=46 blockGap=8
//% trackArgs=0
bool wasPressed(Button_ button) {
    return button->wasPressed();
}

/**
 * Gets the component identifier for the button
 */
//%
int id(Button_ button) {
    return button->id;
}

/**
 * Gets the pressure level on the button 0 to 512.
 */
//%
int pressureLevel(Button_ button) {
    return ((PressureButton *)button)->pressureLevel();
}

} // namespace ButtonMethods

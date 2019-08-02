#include "pxt.h"

// update sim if modifying these
#define ROT_EV_TIMER 0x1233
#define ROT_EV_CHANGED 0x2233

const static int8_t posMap[] = {0, +1, -1, +2, -1, 0, -2, +1, +1, -2, 0, -1, +2, -1, +1, 0};

class RotaryEncoder_ {
  public:
    uint16_t id;
    uint16_t state;
    int position;
    Pin &pinA, &pinB;

    void process(Event) {
        // based on comments in https://github.com/PaulStoffregen/Encoder/blob/master/Encoder.h
        uint16_t s = state & 3;
        if (pinA.getDigitalValue())
            s |= 4;
        if (pinB.getDigitalValue())
            s |= 8;

        state = (s >> 2);
        if (posMap[s]) {
            int lastPosition = position;
            position += posMap[s];
            if ((lastPosition >> 2) != (position >> 2)) {
                Event ev(id, ROT_EV_CHANGED);
            }
        }
    }

    RotaryEncoder_(Pin &pinA, Pin &pinB) : pinA(pinA), pinB(pinB) {
        position = 0;
        id = pinA.id;

        pinA.setPull(codal::PullMode::Up);
        pinB.setPull(codal::PullMode::Up);

        // don't do exactly 1000us, so that it doesn't occur exactly at scheduler ticks
        system_timer_event_every_us(973, id, ROT_EV_TIMER);
        EventModel::defaultEventBus->listen(id, ROT_EV_TIMER, this, &RotaryEncoder_::process,
                                            MESSAGE_BUS_LISTENER_IMMEDIATE);
    }
};

typedef class RotaryEncoder_ *RotaryEncoder;

/**
 * Rotary and other encoders
 */
namespace encoders {
/**
 * Create a new rotary encoder connected to given pins
 */
//% weight=99
RotaryEncoder createRotaryEncoder(DigitalInOutPin pinA, DigitalInOutPin pinB) {
    if (!pinA && !pinB) {
        pinA = LOOKUP_PIN(ROTARY_ENCODER_A);
        pinB = LOOKUP_PIN(ROTARY_ENCODER_B);
        // not configured?
        if (!pinA && !pinB)
            return NULL;
    }

    if (!pinA || !pinB)
        target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);

    return new RotaryEncoder_(*pinA, *pinB);
}
} // namespace pins

//% noRefCounting fixedInstances
namespace RotaryEncoderMethods {
/**
 * Do something when a rotary encoder changes position
 */
//% blockNamespace="encoders"
//% blockId=rotaryencoderonchaned block="on %this changed"
//% weight=80 blockGap=8
void onChanged(RotaryEncoder encoder, Action body) {
    registerWithDal(encoder->id, ROT_EV_CHANGED, body);
}

/**
 * Get current encoder position.
 */
//% blockNamespace="encoders"
//% blockId=rotaryencoderposition block="%this position"
//% weight=79 blockGap=8
int position(RotaryEncoder encoder) {
    // the position always changes by 4 per tick
    return encoder->position >> 2;
}

} // namespace RotaryEncoderMethods

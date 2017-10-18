#include "pxt.h"
#include "pulse.h"

namespace network {

class CableWrap : public PulseBase {
  public:
    virtual void setPWM(int enabled) {
        pin->setDigitalValue(!enabled);
        pwmstate = enabled;
    }

    virtual void setupPWM() { setPWM(1); }

    virtual void finishPWM() { listen(); }

    virtual void listen() {
        inpin->setPull(PinMode::PullDown);
        inpin->getDigitalValue();
        inpin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
    }

    CableWrap() : PulseBase(PULSE_CABLE_COMPONENT_ID, PIN(TX), PIN(TX)) { setupGapEvents(); }
};
SINGLETON(CableWrap);

/**
 * Send data over cable.
 */
//% parts="cable"
void cableSendPacket(Buffer buf) {
    auto w = getCableWrap();
    w->send(buf);
}

/**
 * Get most recent packet received over cable.
 */
//% parts="cable"
Buffer cablePacket() {
    auto w = getCableWrap();
    return w->getBuffer();
}

/**
 * Run action after a packet is recieved over cable.
 */
//% parts="cable"
void onCablePacket(Action body) {
    getCableWrap(); // attach events
    registerWithDal(PULSE_CABLE_COMPONENT_ID, PULSE_PACKET_EVENT, body);
}

/**
 * Run action after there's an error reciving packet over cable.
 */
//%
void onCableError(Action body) {
    getCableWrap(); // attach events
    registerWithDal(PULSE_CABLE_COMPONENT_ID, PULSE_PACKET_ERROR_EVENT, body);
}

}

#include "pxt.h"

namespace swserial {

class SwSerialProxy {
    public:
#ifdef CODAL_JACDAC_WIRE_SERIAL
    CODAL_JACDAC_WIRE_SERIAL sw;    
#endif

    SwSerialProxy(DigitalInOutPin pin)
#ifdef CODAL_JACDAC_WIRE_SERIAL
        : sw(*pin)
#endif
    {};
};

typedef SwSerialProxy* SwSerial;

/**
* Creates a new single wire serial instance over the given pin
*/
//% group="Single Wire" parts="swserial"
SwSerial createSingleWireSerial(DigitalInOutPin pin) {
#ifdef CODAL_JACDAC_WIRE_SERIAL
    return new SwSerialProxy(pin);
#else
    return NULL;
#endif
}

} // namespace serial

namespace SwSerialMethods {

/**
* Sets the baud rate
*/
//%
void setBaudRate(swserial::SwSerial d, int rate) {
#ifdef CODAL_JACDAC_WIRE_SERIAL
    d->sw.setBaud(rate);
#endif
}

/**
* Sends a buffer of the pin
*/
//%
void writeBuffer(swserial::SwSerial sw, Buffer buf) {
#ifdef CODAL_JACDAC_WIRE_SERIAL
    sw->sw.send(buf->data, buf->length);
#endif
}


/**
* Receives a buffer over the pin
*/
//%
Buffer readBuffer(swserial::SwSerial sw, int length) {
    auto buf = pxt::mkBuffer(NULL, length);
#ifdef CODAL_JACDAC_WIRE_SERIAL
    sw->sw.receive(buf->data, buf->length);
#endif
    return buf;
}

} // namespace SwSerialMethods
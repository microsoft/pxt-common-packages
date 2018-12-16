#include "pxt.h"

// TODO
#define TX_CONFIGURED       0x02

namespace swserial {

class SwSerialProxy {
    public:
#ifdef CODAL_JACDAC_WIRE_SERIAL
    CODAL_JACDAC_WIRE_SERIAL sw;    
    Buffer buf;
#endif

    SwSerialProxy(DigitalInOutPin pin, int baud)
#ifdef CODAL_JACDAC_WIRE_SERIAL
        : sw(*pin), buf(NULL)
#endif
    {
#ifdef CODAL_JACDAC_WIRE_SERIAL
        sw.setBaud(baud);
        sw.setDMACompletionHandler(this, &swserial::SwSerialProxy::dmaCompletedHandler);
#endif
    };

    ~SwSerialProxy() {
        if (this->buf) {
            decrRC(buf);
            this->buf = NULL;
        }
    }

    int writeBuffer(Buffer buf) {
    #ifdef CODAL_JACDAC_WIRE_SERIAL
        if (this->buf) // already in use
            return DEVICE_SERIAL_IN_USE;
        this->buf = mkBuffer(buf->data, buf->length);
        this->sw.sendDMA(this->buf->data, this->buf->length);
        fiber_sleep(0);
        fiber_wake_on_event(this->sw.id, SWS_EVT_DATA_SENT);
        if (this->buf) {
            decrRC(this->buf);
            this->buf = NULL;
        }
    #endif
        return DEVICE_OK;
    }

    int readBuffer(Buffer buf) {
    #ifdef CODAL_JACDAC_WIRE_SERIAL
        if (this->buf) // already in use
            return DEVICE_SERIAL_IN_USE;
        this->buf = buf;
        this->sw.receiveDMA(this->buf->data, this->buf->length);
        fiber_sleep(0);
        fiber_wake_on_event(this->sw.id, SWS_EVT_DATA_RECEIVED);
    #endif
        return DEVICE_OK;
    }

    void dmaCompletedHandler(Event ev) {
        if (ev.value == SWS_EVT_ERROR) {
            // unlock fibers
            if (this->buf) {
                auto tx = !!(this->sw.status & TX_CONFIGURED);
                if (tx)
                    decrRC(buf);
                this->buf = NULL;
                auto mode = tx ? SWS_EVT_DATA_SENT: SWS_EVT_DATA_RECEIVED;
                Event ev(this->sw.id, mode, CREATE_ONLY);
            }            
        }
    }

    void setBaudRate(int rate) {
    #ifdef CODAL_JACDAC_WIRE_SERIAL
        this->sw.setBaud(rate);
    #endif
    }

};

typedef SwSerialProxy* SwSerial;

/**
* Creates a new single wire serial instance over the given pin.
*/
//% baud.defl=250000
//% group="Single Wire" parts="swserial"
SwSerial createSingleWireSerial(DigitalInOutPin pin, int baud) {
#ifdef CODAL_JACDAC_WIRE_SERIAL
    return new SwSerialProxy(pin, baud);
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
    sw->writeBuffer(buf);
}


/**
* Receives a buffer over the pin
*/
//%
Buffer readBuffer(swserial::SwSerial sw, int length) {
    auto buf = pxt::mkBuffer(NULL, length);
    sw->readBuffer(buf);
    return buf;
}

} // namespace SwSerialMethods
#include "pxt.h"
#include "JDProtocol.h"
#include "JackRouter.h"

#define JD_DRIVER_EVT_FILL_CONTROL_PACKET 50

namespace jacdac {

#ifndef CODAL_JACDAC_WIRE_SERIAL

class DummyDmaSingleWireSerial : public DMASingleWireSerial {
  protected:
    virtual void configureRxInterrupt(int enable) {}
    virtual int configureTx(int) { return DEVICE_OK; }
    virtual int configureRx(int) { return DEVICE_OK; }

  public:
    DummyDmaSingleWireSerial(Pin &p) : DMASingleWireSerial(p) {}

    virtual int sendDMA(uint8_t *data, int len) { return DEVICE_OK; }
    virtual int receiveDMA(uint8_t *data, int len) { return DEVICE_OK; }
    virtual int abortDMA() { return DEVICE_OK; }

    virtual int putc(char c) { return DEVICE_OK; }
    virtual int getc() { return DEVICE_OK; }

    virtual int send(uint8_t *buf, int len) { return DEVICE_OK; }
    virtual int receive(uint8_t *buf, int len) { return DEVICE_OK; }

    virtual int setBaud(uint32_t baud) { return DEVICE_OK; }
    virtual uint32_t getBaud() { return 0; }
    virtual int sendBreak() { return DEVICE_OK; }
};

#define CODAL_JACDAC_WIRE_SERIAL DummyDmaSingleWireSerial
#endif

// Wrapper classes
class WProtocol {
  public:
    CODAL_JACDAC_WIRE_SERIAL sws;
    codal::JACDAC jd;
    codal::JDProtocol protocol; // note that this is different pins than io->i2c
    codal::JackRouter *jr;
    WProtocol()
        : sws(*LOOKUP_PIN(JACK_TX))
#if CODAL_JACDAC_PIN_CTOR
        , jd(*LOOKUP_PIN(JACK_TX), sws)
#else
        , jd(sws)
#endif       
        , protocol(jd) {
        if (LOOKUP_PIN(JACK_HPEN)) {
            jr = new codal::JackRouter(*LOOKUP_PIN(JACK_TX), *LOOKUP_PIN(JACK_SENSE),
                                       *LOOKUP_PIN(JACK_HPEN), *LOOKUP_PIN(JACK_BZEN),
                                       *LOOKUP_PIN(JACK_PWREN), jd);
        } else {
            jr = NULL;
        }
        jd.start();
    }
};
SINGLETON(WProtocol);

void setJackRouterOutput(int output) {
    auto jr = getWProtocol()->jr;
    if (!jr)
        return;
    if (output < 0)
        return;
    switch (output) {
    case 0:
        jr->forceState(JackState::None);
        break;
    case 1:
        jr->forceState(JackState::BuzzerAndSerial);
        break;
    case 2:
        jr->forceState(JackState::HeadPhones);
        break;
    }
}

/**
 * Starts the JacDac protocol
 */
//%
void start() {
    auto p = getWProtocol();
    if (!p->jd.isRunning())
        p->jd.start();
}

/**
 * Starts the JacDac protocol
 */
//%
void stop() {
    auto p = getWProtocol();
    if (p->jd.isRunning())
        p->jd.stop();
}

/**
* Clears any existing bridge
*/
//%
void clearBridge() {
    // TODO
  //  auto p = getWProtocol();
//    p->protocol.setBridge(NULL);
}

class JDProxyDriver : public JDDriver {
  public:
    RefCollection *methods;
    Buffer _controlData; // may be NULL

    JDProxyDriver(JDDevice d, RefCollection *m, Buffer controlData) 
        : JDDriver(d)
        , methods(m)
        , _controlData(controlData) {
        incrRC(this->methods);
        registerGCPtr((TValue)this->methods);
        if (this->_controlData) {
            incrRC(this->_controlData);
            registerGCPtr((TValue)this->_controlData);
        }
    }

    virtual int fillControlPacket(JDPkt* p) {
        if (NULL != _controlData && _controlData->length) {
            ControlPacket* cp = (ControlPacket*)p->data;
            auto n = min(CONTROL_PACKET_PAYLOAD_SIZE, this->_controlData->length);
            memcpy(cp->data, this->_controlData->data, n);
            Event(this->id, JD_DRIVER_EVT_FILL_CONTROL_PACKET);
        }
        return DEVICE_OK;
    }

    virtual int handleControlPacket(JDPkt *p) {
        ControlPacket* cp = (ControlPacket*)p->data;
        if (this->device.isPairedDriver() && !this->device.isPaired())
        {
            DMESG("NEED TO PAIR!");
            if (cp->flags & CONTROL_JD_FLAGS_PAIRABLE)
            {
                DMESG("PAIR!");
                sendPairingPacket(JDDevice(cp->address, JD_DEVICE_FLAGS_REMOTE | JD_DEVICE_FLAGS_INITIALISED | JD_DEVICE_FLAGS_CP_SEEN, cp->serial_number, cp->driver_class));
            }
        }

        auto buf = pxt::mkBuffer((const uint8_t *)cp, sizeof(ControlPacket));
        auto r = pxt::runAction1(methods->getAt(1), (TValue)buf);
        auto retVal = numops::toBool(r) ? DEVICE_OK : DEVICE_CANCELLED;
        decr(r);
        decrRC(buf);
        return retVal;
    }

    virtual int handlePacket(JDPkt *p) {
        auto buf = pxt::mkBuffer((const uint8_t *)&p->crc, p->size + 4);
        auto r = pxt::runAction1(methods->getAt(0), (TValue)buf);
        auto retVal = numops::toBool(r) ? DEVICE_OK : DEVICE_CANCELLED;
        decr(r);
        decrRC(buf);
        return retVal;
    }

    bool isPairedInstanceAddress(uint8_t address) {
        return NULL != this->pairedInstance && this->pairedInstance->getAddress() == address;
    }

    JDDevice *getDevice() { return &device; }

    ~JDProxyDriver() {
        decrRC(methods);
        unregisterGCPtr((TValue)methods);
        if (_controlData) {
            decrRC(_controlData);
            unregisterGCPtr((TValue)_controlData);
        }
    }
};

typedef JDProxyDriver* JacDacDriverStatus;
typedef RefCollection* MethodCollection;
/**
Internal
*/
//%
JacDacDriverStatus __internalAddDriver(int driverType, int driverClass, MethodCollection methods, Buffer controlData) {
    getWProtocol();
    return new JDProxyDriver(JDDevice((DriverType)driverType, driverClass), methods, controlData);
}

/**
 * Internal
 */
//%
int __internalSendPacket(Buffer buf, int deviceAddress) {
    getWProtocol();
    return JDProtocol::send(buf->data, buf->length, deviceAddress);
}

} // namespace jacdac

namespace JacDacDriverStatusMethods {

/**
* Returns the JDDevice instnace
*/
//% property
Buffer device(JacDacDriverStatus d) {
    return pxt::mkBuffer((const uint8_t *)d->getDevice(), sizeof(JDDevice));
}

/** Check if driver is connected. */
//% property
bool isConnected(JacDacDriverStatus d) {
    return d->isConnected();
}

/** Get device id for events. */
//% property
uint32_t id(JacDacDriverStatus d) {
    return d->id;
}

/** If paired, paired instance address */
//% property
bool isPairedInstanceAddress(JacDacDriverStatus d, uint8_t address) {
    return d->isPairedInstanceAddress(address);
}

/**
* Set driver as bridge
*/
//%
void setBridge(JacDacDriverStatus d) {
    jacdac::getWProtocol()->protocol.setBridge(*d);
}

} // namespace JacDacDriverStatusMethods

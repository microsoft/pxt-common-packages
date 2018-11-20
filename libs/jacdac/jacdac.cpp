#include "pxt.h"
#include "JDProtocol.h"
#include "JackRouter.h"

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
#ifdef CODAL_JACDAC_SUPER_UGLY_CTOR
        : sws(*LOOKUP_PIN(JACK_TX), SERCOM0, 0, PINMUX_PA04D_SERCOM0_PAD0, 0)
#else
        : sws(*LOOKUP_PIN(JACK_TX))
#endif
          ,
          jd(*LOOKUP_PIN(JACK_TX), sws), protocol(jd) {
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

class JDProxyDriver : public JDDriver {
  public:
    RefCollection *methods;

    JDProxyDriver(JDDevice d, RefCollection *m) : JDDriver(d) {
        this->methods = m;
        incrRC(m);
        registerGCPtr((TValue)m);
    }

    virtual int handleControlPacket(JDPkt *p) {
        auto buf = pxt::mkBuffer((const uint8_t *)&p->crc, p->size + 4);
        auto r = pxt::runAction1(methods->getAt(0), (TValue)buf);
        auto retVal = numops::toBool(r) ? DEVICE_OK : DEVICE_CANCELLED;
        decr(r);
        decrRC(buf);
        return retVal;
    }

    virtual int handlePacket(JDPkt *p) {
        auto buf = pxt::mkBuffer((const uint8_t *)&p->crc, p->size + 4);
        auto r = pxt::runAction1(methods->getAt(1), (TValue)buf);
        auto retVal = numops::toBool(r) ? DEVICE_OK : DEVICE_CANCELLED;
        decr(r);
        decrRC(buf);
        return retVal;
    }

    virtual int fillControlPacket(JDPkt *p) {
        auto buf = pxt::mkBuffer((const uint8_t *)&p->crc, JD_SERIAL_DATA_SIZE + 4);
        auto r = pxt::runAction1(methods->getAt(2), (TValue)buf);
        memcpy(&p->crc, buf->data, JD_SERIAL_DATA_SIZE + 4);
        (void)r;
        // decr(r); // TODO compiler might return non-null on void functions, so better skip
        // decr
        decrRC(buf);
        return DEVICE_OK;
    }

    virtual int deviceConnected(JDDevice device) {
        auto r = JDDriver::deviceConnected(device);
        auto buf = pxt::mkBuffer((const uint8_t *)&device, sizeof(JDDevice));
        pxt::runAction1(methods->getAt(3), (TValue)buf);
        decrRC(buf);
        return r;
    }

    virtual int deviceRemoved() {
        auto r = JDDriver::deviceRemoved();
        pxt::runAction0(methods->getAt(4));
        return r;
    }

    void sendPairing(JDDevice dev) {
        this->sendPairingPacket(dev);
    }

    bool isPairedInstanceAddress(uint8_t address) {
        return NULL != this->pairedInstance && this->pairedInstance->getAddress() == address;
    }

    JDDevice *getDevice() { return &device; }

    ~JDProxyDriver() {
        decrRC(methods);
        unregisterGCPtr((TValue)methods);
    }
};

//%
JDProxyDriver *__internalAddDriver(int driverType, int driverClass, RefCollection *methods) {
    getWProtocol();
    return new JDProxyDriver(JDDevice((DriverType)driverType, driverClass), methods);
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
 * Retrieves the serial number in use by this driver.
 *
 * @return the serial number
 **/
//% property
uint32_t serialNumber(JacDacDriverStatus d) {
    return d->getSerialNumber();
}

/** Check if device is paired. */
//% property
bool isPaired(JacDacDriverStatus d) {
    return d->isPaired();
}

/** Check if device is pairable. */
//% property
bool isPairable(JacDacDriverStatus d) {
    return d->isPairable();
}

/** Check if driver is virtual. */
//% property
bool isVirtualDriver(JacDacDriverStatus d) {
    return d->getDevice()->isVirtualDriver();
}

/** Check if driver is paired. */
//% property
bool isPairedDriver(JacDacDriverStatus d) {
    return d->getDevice()->isPairedDriver();
}

/** Check if driver is connected. */
//% property
bool isConnected(JacDacDriverStatus d) {
    return d->isConnected();
}

/** Get device class. */
//% property
uint32_t driverClass(JacDacDriverStatus d) {
    return d->getClass();
}

/** Get device class. */
//% property
uint8_t driverAddress(JacDacDriverStatus d) {
    return d->getAddress();
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

/** Sends a pairing packet */
//%
void sendPairingPacket(JacDacDriverStatus d, Buffer buf) {
    JDDevice dev(0);
    memset(&dev, 0, sizeof(JDDevice));
    memcpy(&dev, buf->data, min(buf->length, sizeof(JDDevice)));
    d->sendPairing(dev);
}

} // namespace JacDacDriverStatusMethods

#include "pxt.h"
#include "JDProtocol.h"

namespace jacdac {

class JDProxyDriver : public JDDriver {
  public:
    RefCollection *methods;

    JDProxyDriver(JDDevice d, RefCollection *m, int id) : JDDriver(d, id) {
        this->methods = m;
        incrRC(m);
    }

    virtual int handleControlPacket(JDPkt *p) {
        auto buf = pxt::mkBuffer((const uint8_t*)&p->crc, p->size + 4);
        auto r = pxt::runAction1(methods->getAt(0), (TValue)buf);
        auto retVal = numops::toBool(r) ? DEVICE_OK : DEVICE_CANCELLED;
        decr(r);
        decrRC(buf);
        return retVal;
    }

    virtual int handlePacket(JDPkt *p) {
        auto buf = pxt::mkBuffer((const uint8_t*)&p->crc, p->size + 4);
        auto r = pxt::runAction1(methods->getAt(1), (TValue)buf);
        auto retVal = numops::toBool(r) ? DEVICE_OK : DEVICE_CANCELLED;
        decr(r);
        decrRC(buf);
        return retVal;
    }

    virtual int fillControlPacket(JDPkt *p) {
        auto buf = pxt::mkBuffer((const uint8_t*)&p->crc, JD_SERIAL_DATA_SIZE + 4);
        auto r = pxt::runAction1(methods->getAt(2), (TValue)buf);
        memcpy(&p->crc, buf->data, JD_SERIAL_DATA_SIZE + 4);
        (void)r;
        // decr(r); // TODO compiler might return non-null on void functions, so better skip decr
        decrRC(buf);
        return DEVICE_OK;
    }

    virtual int deviceConnected(JDDevice device) {
        auto r = JDDriver::deviceConnected(device);
        pxt::runAction0(methods->getAt(3));
        return r;
    }

    virtual int deviceRemoved() {
        auto r = JDDriver::deviceRemoved();
        pxt::runAction0(methods->getAt(4));
        return r;
    }

    JDDevice *getDevice() { return &device; }

    ~JDProxyDriver() { decrRC(methods); }
};

//%
JDProxyDriver *__internalAddDriver(int driverType, int driverClass, RefCollection *methods) {
    static int deviceId = 3030;
    return new JDProxyDriver(JDDevice(driverType, driverClass), methods, ++deviceId);
}

//%
void __internalSendPairingPacket(int address, uint32_t flags, int serialNumber, uint32_t driverClass) {
    sendPairingPacket(JDDevice(address, flags, serialNumber, driverClass));    
}

//%
int sendPacket(Buffer buf, int deviceAddress) {
    return JDProtocol::send(buf->data, buf->length, deviceAddress);
}

} // namespace jacdac

namespace JacDacDriverStatusMethods {

/** Check if driver is a virtual driver. */
//% property
bool isVirtualDriver(JacDacDriverStatus d) {
    return d->isVirtualDriver();
}

/** Check if device is paired. */
//% property
bool isPaired(JacDacDriverStatus d) {
    return d->isPaired();
}

/** Check if driver is paired. */
//% property
bool isPairedDriver(JacDacDriverStatus d) {
    return d->isPairedDriver();
}

/** Check if driver is connected. */
//% property
bool isConnected(JacDacDriverStatus d) {
    return d->isConnected();
}

/** Get device class. */
//% property
uint32_t driverClass(JacDacDriverStatus d) {
    return d->getDevice()->driver_class;
}

/** Get device class. */
//% property
uint8_t address(JacDacDriverStatus d) {
    return d->getDevice()->address;
}

/** Get device id for events. */
//% property
bool id(JacDacDriverStatus d) {
    return d->id;
}

/** If paired, paired instance address */
//% property
uint32_t pairedInstanceAddress(JacDacDriverStatus d) {
    return pd->isPaired() && NULL !== d->pairedInstance 
        ? d->pairedInstance->getAddress() 
        : 0;
}

} // namespace JacDacDriverStatusMethods

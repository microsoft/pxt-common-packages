#include "pxt.h"
#include "JDProtocol.h"

namespace network {

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
JDProxyDriver *addNetworkDriver(int driverClass, RefCollection *methods) {
    static int deviceId = 3030;
    return new JDProxyDriver(JDDevice(0, 0, 0, driverClass), methods, ++deviceId);
}

} // namespace network


namespace NetworkDriverStatusMethods {

/** Check if driver is connected. */
//% property
bool isConnected(NetworkDriverStatus d) {
    return d->isConnected();
}

/** Get device class. */
//% property
bool driverClass(NetworkDriverStatus d) {
    return d->getDevice()->driver_class;
}

/** Get device class. */
//% property
bool driverAddress(NetworkDriverStatus d) {
    return d->getDevice()->address;
}

/** Get device id for events. */
//% property
bool deviceId(NetworkDriverStatus d) {
    return d->id;
}

} // namespace NetworkDriverStatusMethods

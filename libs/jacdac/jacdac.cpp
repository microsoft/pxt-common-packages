

#include "pxt.h"
#include "JACDAC.h"
#include "JDPhysicalLayer.h"
#include "JDService.h"
#include "JackRouter.h"

namespace jacdac {

// Wrapper classes
class WJacDac {
    CODAL_JACDAC_WIRE_SERIAL sws;
    codal::JACDAC jd;
    codal::JDPhysicalLayer protocol; // note that this is different pins than io->i2c
    codal::JackRouter *jr;
  public:
    WJacDac()
        : sws(*LOOKUP_PIN(JACK_TX))
        , protocol(jd, LOOKUP_PIN(JACK_BUSLED), LOOKUP_PIN(JACK_COMMLED)) 
        {
        if (LOOKUP_PIN(JACK_HPEN)) {
            jr = new codal::JackRouter(*LOOKUP_PIN(JACK_TX), *LOOKUP_PIN(JACK_SENSE),
                                       *LOOKUP_PIN(JACK_HPEN), *LOOKUP_PIN(JACK_BZEN),
                                       *LOOKUP_PIN(JACK_PWREN), jd);
            jr->forceState(JackState::BuzzerAndSerial);
        } else {
            jr = NULL;
        }
        jd.start();
    }

    void start() {
    if (!jd.isRunning())
        jd.start();
    }

    void stop() {
    if (jd.isRunning())
        jd.stop();
    }

    bool isRunning() {
        return jd.isRunning();
    }

    bool isConnected() {
        return jd.isConnected();
    }

    void setBridge(JDService* driver) {
        protocol.setBridge(driver);
    }

    void setJackRouterOutput(int output) {
#if 0
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
#endif
    }

    Buffer drivers() {
        if (!JDPhysicalLayer::instance)
            return mkBuffer(NULL, 0);

        // determine the number of drivers
        auto pDrivers = JDPhysicalLayer::instance->drivers;
        int n = 0;
        for(int i = 0; i < JD_PROTOCOL_DRIVER_ARRAY_SIZE; ++i) {
            if (NULL != pDrivers[i])
                n++;
        }
        // allocate n * sizeof(JDDevice)
        auto buf = mkBuffer(NULL, n * sizeof(JDDevice));
        // fill up
        int k = 0;
        for(int i = 0; i < JD_PROTOCOL_DRIVER_ARRAY_SIZE; ++i) {
            auto pDriver = pDrivers[i];
            if (NULL != pDriver) {
                auto device = pDriver->getState();
                memcpy(buf->data + k, &device, sizeof(JDDevice));
                k += sizeof(JDDevice);
            }
        }
        // we're done!
        return buf;
    }

    int id() {
        return jd.id;
    }

    int logicId() {
        auto pLogic = JDPhysicalLayer::instance->drivers[0];
        return pLogic ? pLogic->id : 0;
    }

    int state() {
    return (int)jd.getState();
    }
};
SINGLETON_IF_PIN(WJacDac, JACK_TX);

void setJackRouterOutput(int output) {
    auto service = getWJacDac();
    if (!service) return;
    service->setJackRouterOutput(output);
}

/**
 * Starts the JacDac protocol
 */
//% parts=jacdac
void start() {
    auto service = getWJacDac();
    if (!service) return;
    service->start();
}

/**
* Gets the bus state
*/
//% parts=jacdac
int state() {
    auto service = getWJacDac();
    return service ? service->state() : -1;
}
/**
 * Starts the JacDac protocol
 */
//% parts=jacdac
void stop() {
    auto service = getWJacDac();
    if (!service) return;
    service->stop();
}

/**
* Indicates if JacDac is running
*/
//% parts=jacdac
bool isRunning() {
    auto service = getWJacDac();
    return !!service && service->isRunning();
}

/**
* true if connected, false if there's a bad bus condition.
*/
//% parts=jacdac
bool isConnected() {
    auto service = getWJacDac();
    return !!service && service->isConnected();
}

/**
* Gets the jacdac event id
*/
//% parts=jacdac
int eventId() {
    auto service = getWJacDac();
    if (!service) return -1;
    return service->id();
}

/**
* Gets the jacdac logic driver event id
*/
//% parts=jacdac
int logicEventId() {
    auto service = getWJacDac();
    if (!service) return -1;
    return service->logicId();
}

/**
* Clears any existing bridge
*/
//% parts=jacdac
void clearBridge() {
    auto service = getWJacDac();
    if (!service) return;
#if JD_MIN_VERSION(3)
    service->setBridge(NULL);
#endif    
}

/**
* Gets a snapshot of the drivers registered on the bus. Array of JDDevice
*/
//% parts=jacdac
Buffer __internalDrivers() {
    auto service = getWJacDac();
    if (!service) return mkBuffer(NULL, 0);
    return service->drivers();
}

class JDProxyService : public JDService 
{
  public:
    RefCollection *methods;
    Buffer _controlData; // may be NULL

    JDProxyService(JDDevice d, RefCollection *m, Buffer controlData) 
        : JDService(d)
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

    ~JDProxyService() {
        decrRC(methods);
        unregisterGCPtr((TValue)methods);
        if (_controlData) {
            decrRC(_controlData);
            unregisterGCPtr((TValue)_controlData);
        }
    }
};


typedef JDProxyService* JDServiceStatus;
typedef RefCollection* MethodCollection;
/**
Internal
*/
//% parts=jacdac
JDServiceStatus __internalAddDriver(int driverType, int driverClass, MethodCollection methods, Buffer controlData) {
    DMESG("jd: adding driver %d %d", driverType, driverClass);
    getWJacDac();
    return new JDProxyService(JDDevice((DriverType)driverType, driverClass), methods, controlData);
}

/**
* Internal
*/
//% parts=jacdac
void __internalRemoveDriver(JDServiceStatus d) {
    DMESG("jd: deleting driver %p", d);
    if (NULL == d) return;
    delete d; // removes driver
}

/**
 * Internal
 */
//% parts=jacdac
int __internalSendPacket(Buffer buf, int deviceAddress) {
    getWJacDac();
    return JDPhysicalLayer::send(buf->data, buf->length, deviceAddress);
}

} // namespace jacdac

namespace JDServiceStatusMethods {

/**
* Returns the JDDevice instance
*/
//% property
Buffer device(JDServiceStatus d) {
    return pxt::mkBuffer((const uint8_t *)d->getDevice(), sizeof(JDDevice));
}

/** Check if driver is connected. */
//% property
bool isConnected(JDServiceStatus d) {
    return d->isConnected();
}

/**
* Sets the error state on the device
*/
//%
void setError(JDServiceStatus d, int error) {
    d->getDevice()->setError((DriverErrorCode)error);
}

/** Get device id for events. */
//% property
uint32_t id(JDServiceStatus d) {
    return d->id;
}

/** If paired, paired instance address */
//% property
bool isPairedInstanceAddress(JDServiceStatus d, uint8_t address) {
    return d->isPairedInstanceAddress(address);
}

/**
* Set driver as bridge
*/
//%
void setBridge(JDServiceStatus d) {
    jacdac::getWJacDac()->setBridge(d);
}

} // namespace JDServiceStatusMethods

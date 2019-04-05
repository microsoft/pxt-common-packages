

#include "pxt.h"
#include "JACDAC.h"
#include "JDPhysicalLayer.h"

namespace jacdac {

class WJDPhysicalLayer {
    CODAL_JACDAC_WIRE_SERIAL sws;
    JDPhysicalLayer phys;

  public:
    WJDPhysicalLayer() :
        sws(*LOOKUP_PIN(JACK_TX)),
        phys(sws, *pxt::getJACDACTimer(), LOOKUP_PIN(JACK_BUSLED), LOOKUP_PIN(JACK_COMMLED))
    {
        sws.setBaud(1000000);
    }

    void send(Buffer b)
    {
        phys.send((JDPacket*)b->data);
    }

    bool isConnected() {
        return phys.isConnected();
    }

    bool isRunning() { 
        return phys.isRunning();
    }

    int getId()
    {
        return phys.id;
    }

    int getState() {
        return phys.getState();
    }

    JDPacket* getPacket()
    {
        return phys.getPacket();
    }

    void start()
    {
        phys.start();
    }

    void stop()
    {
        phys.stop();
    }
};

SINGLETON_IF_PIN(WJDPhysicalLayer, JACK_TX);

/**
* Gets the physical layer component id
**/
//%
int __physId() {
    auto jd = getWJDPhysicalLayer();
    return jd ? jd->getId() : -1;
}

/**
 * Write a buffer to the jacdac physical layer.
 **/
//%
void __physSendPacket(Buffer buf) {
    auto jd = getWJDPhysicalLayer();
    if (jd)
        jd->send(buf);
}

/**
* Reads a packet from the queue. NULL if queue is empty
**/
//%
Buffer __physGetPacket() {
    auto jd = getWJDPhysicalLayer();
    Buffer buf = NULL;
    if (jd) {
        auto pkt = jd->getPacket();
        if (pkt)
        {
            buf = mkBuffer((uint8_t*)pkt, sizeof(JDPacket));
            free(pkt);
        }
    }
    return buf;
}

/**
 * Returns the connection state of the JACDAC physical layer.
 **/
//%
bool __physIsConnected() {
    auto jd = getWJDPhysicalLayer();
    return jd && jd->isConnected();
}

/**
 * Indicates if the bus is running
 **/
//%
bool __physIsRunning() {
    auto jd = getWJDPhysicalLayer();
    return jd && jd->isRunning();
}

/**
 * Starts the JACDAC physical layer.
 **/
//%
void __physStart()
{
    auto jd = getWJDPhysicalLayer();
    if (jd)
        jd->start();
}

/**
 * Stops the JACDAC physical layer.
 **/
//%
void __physStop()
{
    auto jd = getWJDPhysicalLayer();
    if (jd)
        jd->stop();
}

}
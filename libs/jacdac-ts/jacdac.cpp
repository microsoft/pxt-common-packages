

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
        phys.start();
    }

    void send(Buffer b)
    {
        phys.send((JDPacket*)b->data);
    }

    bool isConnected() {
        return phys.isConnected();
    }
};

SINGLETON_IF_PIN(WJDPhysicalLayer, JACK_TX);

/**
 * Write a buffer to the jacdac physical layer.
 **/
//%
void __writeBuffer(Buffer buf) {
    auto jd = getWJDPhysicalLayer();
    // TODO pass it to layer
    if (jd)
        jd->send(buf);
}


/**
 * Returns the connection state of the JACDAC physical layer.
 **/
//%
bool __isConnected() {
    auto jd = getWJDPhysicalLayer();
    return jd && jd->isConnected();
}

}


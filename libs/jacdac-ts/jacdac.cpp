

#include "pxt.h"
#include "JACDAC.h"
#include "JPhysicalLayer.h"

namespace jacdac {

class WJDPhysicalLayer {
    CODAL_JACDAC_WIRE_SERIAL pl;
  public:
    JDPhysicalLayer()
    {
        pl.start();
    }

    bool isConnected() {
        return pl.isConnected();
    }
};

SINGLETON_IF_PIN(WJDPhysicalLayer, JACK_TX);


//%
void __writeBuffer(Buffer: buf) {
    auto jd = getWJDPhysicalLayer();
    // TODO pass it to layer
}
    
//%
bool __isConnected() {
    auto jd = getWJDPhysicalLayer();
    return jd->isConnected();
}

}

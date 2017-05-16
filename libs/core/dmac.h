#ifndef __DMAC_H
#define __DMAC_H

#include "pxt.h"
#include "SAMD21DAC.h"

namespace pxt {

class WDMAC {
  public:
    SAMD21DMAC dmac;

    WDMAC() {}
};

WDMAC* getWDMAC();

}

#endif
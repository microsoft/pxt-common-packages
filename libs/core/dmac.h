#ifndef __DMAC_H
#define __DMAC_H

#include "pxt.h"

namespace pxt {

#ifdef PlatformDMAC
class WDMAC {
  public:
    PlatformDMAC dmac;

    WDMAC() {}
};

WDMAC* getWDMAC();
#endif

}

#endif
#ifndef __DMAC_H
#define __DMAC_H

#include "pxt.h"

namespace pxt {

#ifdef CODAL_DMAC
class WDMAC {
  public:
    CODAL_DMAC dmac;

    WDMAC() {}
};

WDMAC* getWDMAC();
#endif

}

#endif
#include "dmac.h"
#include "SAMD21DAC.h"
#include "Mixer.h"

// DAC always on PA02 on SAMD21
#define DAC_PIN PA02

class SoundOutput {
  public:
    SAMD21DAC dac;

    SoundOutput(DataSource &data) : dac(*lookupPin(DAC_PIN), pxt::getWDMAC()->dmac, data) {}
};


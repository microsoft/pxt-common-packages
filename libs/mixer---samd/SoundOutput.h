#include "SAMDDAC.h"
#include "Synthesizer.h"
#include "Mixer.h"

namespace jacdac {
void setJackRouterOutput(int output);
}

class SoundOutput {
  public:
    SAMDDAC dac;

    SoundOutput(DataSource &data)
        : dac(*pxt::lookupPin(PIN_PA02), data, SAMDDAC_DEFAULT_FREQUENCY, DEVICE_ID_SYSTEM_DAC,
              getConfig(CFG_PIN_JACK_SND, 0) >> 16) {
        jacdac::setJackRouterOutput(-1);
    }

    void setOutput(int output) { jacdac::setJackRouterOutput(output); }
};

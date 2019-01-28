#include "SAMDDAC.h"
#include "Synthesizer.h"
#include "Mixer.h"

namespace jacdac {
void setJackRouterOutput(int output);
}

class SoundOutput {
  public:
    SAMDDAC dac;

    SoundOutput(DataSource &data) : dac(*pxt::lookupPin(PIN_PA02), data) {
        jacdac::setJackRouterOutput(-1);
    }

    void setOutput(int output) { jacdac::setJackRouterOutput(output); }
};

#include "ZPWM.h"
#include "Synthesizer.h"
#include "Mixer.h"

namespace jacdac {
void setJackRouterOutput(int output);
}

class SoundOutput {
  public:
    ZPWM dac;

    SoundOutput(DataSource &data) : dac(*LOOKUP_PIN(JACK_SND), data) {
        jacdac::setJackRouterOutput(-1);
    }

    void setOutput(int output) { jacdac::setJackRouterOutput(output); }
};

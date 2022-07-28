#include "RP2040PWM.h"
#include "Synthesizer.h"
#include "Mixer.h"

namespace jacdac {
void setJackRouterOutput(int output);
}

class SoundOutput {
  public:
    RP2040PWM dac;

    SoundOutput(DataSource &data) : dac(*LOOKUP_PIN(JACK_SND), data, 44000) {
        jacdac::setJackRouterOutput(-1);
    }

    void setOutput(int output) { jacdac::setJackRouterOutput(output); }
};

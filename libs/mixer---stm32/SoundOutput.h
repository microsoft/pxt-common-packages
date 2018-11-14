#include "ZPWM.h"
#include "Synthesizer.h"
#include "Mixer.h"
#include "JackRouter.h"
#include "ZSingleWireSerial.h"

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

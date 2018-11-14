#include "ZPWM.h"
#include "Synthesizer.h"
#include "Mixer.h"
#include "JackRouter.h"
#include "ZSingleWireSerial.h"

namespace jacdac {
JackRouter *getJackRouter();
}

class SoundOutput {
  public:
    ZPWM dac;

    SoundOutput(DataSource &data) : dac(*LOOKUP_PIN(JACK_SND), data) { jacdac::getJackRouter(); }

    void setOutput(int output) {
        auto jr = jacdac::getJackRouter();
        if (!jr)
            return;
        switch (output) {
        case 0:
            jr->forceState(JackState::None);
            break;
        case 1:
            jr->forceState(JackState::BuzzerAndSerial);
            break;
        case 2:
            jr->forceState(JackState::HeadPhones);
            break;
        }
    }
};

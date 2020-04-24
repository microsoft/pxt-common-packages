#include "NRF52PWM.h"
#include "Synthesizer.h"
#include "Mixer.h"

class SoundOutput {
  public:
    NRF52PWM dac;

    SoundOutput(DataSource &data) : dac(NRF_PWM0, data) {
        dac.connectPin(*LOOKUP_PIN(JACK_SND), 0);
    }

    void setOutput(int output) { }
};

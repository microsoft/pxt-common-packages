#include "NRF52PWM.h"
#include "Synthesizer.h"
#include "Mixer.h"

class SoundOutput {
  public:
    NRF52PWM dac;

    SoundOutput(DataSource &data) : dac(NRF_PWM1, data, 44100) {
        dac.setDecoderMode( PWM_DECODER_LOAD_Common );
        dac.connectPin(*LOOKUP_PIN(JACK_SND), 1);
    }
    void setOutput(int output) { }
};

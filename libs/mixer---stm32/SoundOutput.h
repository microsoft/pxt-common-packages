#include "ZPWM.h"
#include "Synthesizer.h"
#include "Mixer.h"
#include "JackRouter.h"
#include "ZSingleWireSerial.h"

class SoundOutput {
  public:
    ZPWM dac;
    ZSingleWireSerial sws;
    PktSerial pktSerial;
    JackRouter jackRouter;

    SoundOutput(DataSource &data)
        : dac(*LOOKUP_PIN(JACK_SND), data),     //
          sws(*LOOKUP_PIN(JACK_TX)),            //
          pktSerial(*LOOKUP_PIN(JACK_TX), sws), //
          jackRouter(*LOOKUP_PIN(JACK_TX), *LOOKUP_PIN(JACK_SENSE), *LOOKUP_PIN(JACK_HPEN),
                     *LOOKUP_PIN(JACK_BZEN), *LOOKUP_PIN(JACK_PWREN), pktSerial) {}
};

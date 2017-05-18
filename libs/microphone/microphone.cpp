#include "pxt.h"
#include "dmac.h"
#include "SAMD21DAC.h"
#include "SAMD21PDM.h"
#include "LevelDetector.h"

namespace pxt {

class WMicrophone {
  public:
    SAMD21PDM microphone;
    LevelDetector level;
    WMicrophone()
        : microphone(*lookupPin(PIN_MIC_DATA), *lookupPin(PIN_MIC_CLOCK), pxt::getWDMAC()->dmac, 10000)
        , level(microphone.output, 80, 20, DEVICE_ID_MICROPHONE)
    {
        microphone.enable();
    }
};
SINGLETON(WMicrophone);

}

namespace input {
/**
* Registers an event that runs when a lound sound is detected
*/
//% help=input/on-loud-sound weight=97
//% blockId=input_on_loud_sound block="on loud sound"
//% parts="microphone" blockGap=8
void onLoudSound(Action handler) {
    getWMicrophone(); // wake up service
    registerWithDal(DEVICE_ID_MICROPHONE, LEVEL_THRESHOLD_HIGH, handler);
}

/**
* Reads the loudness through the microphone from 0 (silent) to 100 (very loud)
*/
//% help=input/sound-level weight=75
//% blockId=device_get_sound_level block="sound level" blockGap=8
//% parts="microphone"
int soundLevel() {
    int value = getWMicrophone()->level.getValue();
    return value;
}
}
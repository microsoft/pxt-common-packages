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
        : microphone(*LOOKUP_PIN(MIC_DATA), *LOOKUP_PIN(MIC_CLOCK), pxt::getWDMAC()->dmac, 10000)
        , level(microphone.output, 968, 256, DEVICE_ID_MICROPHONE)
    {
        microphone.enable();
    }
};
SINGLETON(WMicrophone);

}

namespace input {
#define MICROPHONE_SILENCE 8
#define MICROPHONE_MAX 20000    
/**
* Registers an event that runs when a lound sound is detected
*/
//% help=input/on-loud-sound
//% blockId=input_on_loud_sound block="on loud sound"
//% parts="microphone"
//% weight=88 blockGap=12
void onLoudSound(Action handler) {
    getWMicrophone(); // wake up service
    registerWithDal(DEVICE_ID_MICROPHONE, LEVEL_THRESHOLD_HIGH, handler);
}

/**
* Reads the loudness through the microphone from 0 (silent) to 255 (loud)
*/
//% help=input/sound-level
//% blockId=device_get_sound_level block="sound level"
//% parts="microphone"
//% weight=34 blockGap=8
int soundLevel() {
    const int micValue = getWMicrophone()->level.getValue();
    const int value = max(MICROPHONE_SILENCE, min(micValue, MICROPHONE_MAX));
    return min(0xff, value * 0xff / MICROPHONE_MAX);
}

/**
* Sets the minimum threshold for a loud sound
*/
//% help=input/set-loud-sound-threshold
//% blockId=input_set_loud_sound_threshold block="set loud sound threshold %value"
//% parts="microphone"
//% value.min=1 value.max=100
//% group="More" weight=14 blockGap=8
void setLoudSoundThreshold(int value) {
    // map value 0..255 -> 0..20000
    value = value & 0xff;
    const int scaled = value * MICROPHONE_MAX / 0xff;
    getWMicrophone()->level.setHighThreshold(scaled);
}
}
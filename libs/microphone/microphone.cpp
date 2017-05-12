#include "pxt.h"
#include "dmac.h"
#include "SAMD21DAC.h"
#include "SAMD21PDM.h"
#include "LevelDetector.h"

enum class LoudnessCondition {
    //% block="quiet"
    Quiet = ANALOG_THRESHOLD_LOW,
    //% block="loud"
    Loud = ANALOG_THRESHOLD_HIGH
};

namespace pxt {

class WMicrophone {
  public:
    SAMD21PDM microphone;
    LevelDetector level;
    WMicrophone()
        : microphone(10, 10, pxt::getWDAMC()->dmac, 10000)
        , level(microphone.output, 70, 30)
    {
        microphone.enable();
    }
};
SINGLETON(WMicrophone);

}

namespace input {
/**
* Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
* @param condition the condition that event triggers on
*/
//% help=input/on-sound-condition-changed weight=97
//% blockId=input_on_sound_condition_changed block="on sound %condition"
//% parts="microphone" blockGap=8
void onSoundConditionChanged(LoudnessCondition condition, Action handler) {
    auto mic = getWMicrophone();
    registerWithDal(DEVICE_ID_SYSTEM_LEVEL_DETECTOR, (int)condition, handler);
}

/**
* Reads the loudness through the microphone from 0 (silent) to 255 (very loud)
*/
//% help=input/sound-level weight=75
//% blockId=device_get_sound_level block="sound level" blockGap=8
//% parts="microphone"
int soundLevel() {
    int value = getWMicrophone()->microphone.getValue();
    return value / 4;
}
}
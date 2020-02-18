#include "pxt.h"
#include "LevelDetector.h"
#include "LevelDetectorSPL.h"

#define MICROPHONE_MIN 52.0f
#define MICROPHONE_MAX 120.0f

namespace pxt {
    codal::LevelDetectorSPL* getMicrophoneLevel();
}

namespace input {
/**
* Registers an event that runs when a loud sound is detected
*/
//% help=input/on-loud-sound
//% blockId=input_on_loud_sound block="on loud sound"
//% parts="microphone"
//% weight=88 blockGap=12
void onLoudSound(Action handler) {
    pxt::getMicrophoneLevel(); // wake up service
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
    auto level = pxt::getMicrophoneLevel();
    if (NULL == level)
        return MICROPHONE_MIN;        
    const int micValue = level->getValue();
    const int scaled = max(MICROPHONE_MIN, min(micValue, MICROPHONE_MAX)) - MICROPHONE_MIN;
    return min(0xff, scaled * 0xff / (MICROPHONE_MAX - MICROPHONE_MIN));
}

/**
* Sets the minimum threshold for a loud sound
*/
//% help=input/set-loud-sound-threshold
//% blockId=input_set_loud_sound_threshold block="set loud sound threshold %value"
//% parts="microphone"
//% value.min=1 value.max=255
//% group="More" weight=14 blockGap=8
void setLoudSoundThreshold(int value) {
    auto level = pxt::getMicrophoneLevel();
    if (NULL == level)
        return;

    value = max(0, min(0xff, value));
    const int scaled = MICROPHONE_MIN + value * (MICROPHONE_MAX - MICROPHONE_MIN) / 0xff;
    level->setHighThreshold(scaled);
}
}
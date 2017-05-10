#include "pxt.h"
#include "AnalogSensor.h"

enum class LoudnessCondition {
    //% block="quiet"
    Quiet = ANALOG_THRESHOLD_LOW,
    //% block="loud"
    Loud = ANALOG_THRESHOLD_HIGH
};

namespace pxt {

class WMicrophone {
  public:
    AnalogSensor sensor;
#undef Button
    WMicrophone()
        : sensor(*lookupPin(PIN_MICROPHONE), DEVICE_ID_TOUCH_SENSOR + 1) //
    {
        sensor.init();
        sensor.setPeriod(50);
        sensor.setSensitivity(0.9f);
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
    auto sensor = &getWMicrophone()->sensor;
    sensor->updateSample();
    registerWithDal(sensor->id, (int)condition, handler);
}

/**
* Reads the loudness through the microphone from 0 (silent) to 255 (very loud)
*/
//% help=input/sound-level weight=75
//% blockId=device_get_sound_level block="sound level" blockGap=8
//% parts="microphone"
int soundLevel() {
    int value = getWMicrophone()->sensor.getValue();
    return value / 4;
}
}
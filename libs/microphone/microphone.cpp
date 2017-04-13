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
#define Button DeviceButton *
    Button buttons[0];
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getMicrophoneButton
    //% block="microphone"
    Button microphone;
#undef Button
    WMicrophone()
        : sensor(*lookupPin(PIN_MICROPHONE), DEVICE_ID_TOUCH_SENSOR + 1) //
    {
        memclr(buttons, 4);
        sensor.init();
        sensor.setPeriod(50);
        sensor.setSensitivity(0.9f);
    }
};
SINGLETON(WMicrophone);
const int LastMicrophoneButtonID = &((WMicrophone *)0)->microphone - ((WMicrophone *)0)->buttons;
//%
DeviceButton *getMicrophoneButton(int id) {
    if (id != 0)
        device.panic(42);
    auto w = getWMicrophone();
    if (!w->buttons[id])
        w->buttons[id] = new DeviceButton(*lookupPin(PIN_MICROPHONE), w->sensor.id);
    return w->buttons[id];
}

}

namespace input {
/**
* Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
* @param condition the condition that event triggers on
*/
//% help=input/on-loudness-condition-changed weight=97
//% blockId=input_on_loudness_condition_changed block="on sound %condition"
//% parts="microphone" blockGap=8
void onSoundConditionChanged(LoudnessCondition condition, Action handler) {
    auto sensor = &getWMicrophone()->sensor;
    sensor->updateSample();
    registerWithDal(sensor->id, (int)condition, handler);
}

/**
* Reads the loudness through the microphone from 0 (silent) to 255 (very loud)
*/
//% help=input/loudness weight=75
//% blockId=device_get_sound_level block="sound level" blockGap=8
//% parts="microphone"
int soundLevel() {
    int value = getWMicrophone()->sensor.getValue();
    return value / 4;
}
}
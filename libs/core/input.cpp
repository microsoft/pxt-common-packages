#include "pxt.h"
#include "DeviceSystemTimer.h"
#include "AnalogSensor.h"
#include "NonLinearAnalogSensor.h"


enum class LightCondition {
    //% block="dark"
    Dark = ANALOG_THRESHOLD_LOW,
    //% block="bright"
    Bright = ANALOG_THRESHOLD_HIGH
};

enum class LoudnessCondition {
    //% block="quiet"
    Quiet = ANALOG_THRESHOLD_LOW,
    //% block="loud"
    Loud = ANALOG_THRESHOLD_HIGH
};

enum class TemperatureCondition {
    //% block="cold"
    Cold = ANALOG_THRESHOLD_LOW,
    //% block="hot"
    Hot = ANALOG_THRESHOLD_HIGH
};

enum class TemperatureUnit {
    //% block="°C"
    Celsius,
    //% block="°F"
    Fahrenheit
};

namespace pxt {

// Wrapper classes
#if PIN_TEMPERATURE != NC
class WTemp {
  public:
    NonLinearAnalogSensor sensor;
    WTemp()
        : sensor(*lookupPin(PIN_TEMPERATURE), DEVICE_ID_THERMOMETER, 25, 10000, 3380, 10000,
                 273.5) //
    {
        sensor.init();
    }
};
SINGLETON(WTemp);

#endif

#if PIN_LIGHT != NC
class WLight {
  public:
    AnalogSensor sensor;
#define Button DeviceButton *
    Button buttons[0];
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getLightButton
    //% block="light sensor"
    Button lightSensor;
    WLight()
        : sensor(*lookupPin(PIN_LIGHT), DEVICE_ID_LIGHT_SENSOR) //
    {
        memclr(buttons, 4);
        sensor.init();
        sensor.setPeriod(50);
        sensor.setSensitivity(0.85f);
    }
};
SINGLETON(WLight);
const int LastLightButtonID = &((WLight *)0)->lightSensor - ((WLight *)0)->buttons;
//%
DeviceButton *getLightButton(int id) {
    if (id != 0)
        device.panic(42);
    auto w = getWLight();
    if (!w->buttons[id])
        w->buttons[id] = new DeviceButton(*lookupPin(PIN_LIGHT), w->sensor.id);
    return w->buttons[id];
}
#endif

#if PIN_MICROPHONE != NC
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
#endif

}

//% color="#FB48C7" weight=99 icon="\uf192"
namespace input {

#if PIN_LIGHT != NC
/**
* Registers an event that runs when particular lighting conditions (dark, bright) are encountered.
* @param condition the condition that event triggers on
*/
//% help=input/on-light-condition-changed weight=97
//% blockId=input_on_light_condition_changed block="on light %condition"
//% parts="lightsensor" blockGap=8
void onLightConditionChanged(LightCondition condition, Action handler) {
    auto sensor = &getWLight()->sensor;
    sensor->updateSample();
    registerWithDal(sensor->id, (int)condition, handler);
}

/**
 * Reads the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
 */
//% help=input/light-level weight=76
//% blockId=device_get_light_level block="light level" blockGap=8
//% parts="lightsensor"
int lightLevel() {
    // 0...1023
    int value = getWLight()->sensor.getValue();
    return value / 4;
}
#endif

#if PIN_MICROPHONE != NC
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
#endif

#if PIN_TEMPERATURE != NC
/**
* Registers an event raised when the temperature condition (hold, cold) changes.
* @param condition the condition, hot or cold, the event triggers on
* @param temperature the temperature, in degree Celsius, at which this event happens, eg: 15
*/
//% blockId=input_on_temperature_condition_changed block="on temperature %condition|at (°C)%temperature"
//% parts="thermometer" weight=95 blockGap=8
//% help=input/on-temperature-condition-changed
void onTemperateConditionChanged(TemperatureCondition condition, int temperature, Action handler) {
    auto sensor = &getWTemp()->sensor;
    sensor->updateSample();
    if (condition == TemperatureCondition::Cold)
        sensor->setLowThreshold(temperature);
    else
        sensor->setHighThreshold(temperature);
    registerWithDal(sensor->id, (int)condition, handler);
}

/**
 * Gets the temperature in Celsius or Fahrenheit degrees.
 */
//% weight=75
//% help=input/temperature
//% blockId=device_temperature block="temperature in %unit" blockGap=8
//% parts="thermometer"
int temperature(TemperatureUnit unit) {
    int value = getWTemp()->sensor.getValue();
    if (unit == TemperatureUnit::Celsius) return value;
    else return (value * 18) / 10 + 32;
}
#endif
}

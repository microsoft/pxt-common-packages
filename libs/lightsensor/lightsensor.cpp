#include "pxt.h"
#include "DeviceSystemTimer.h"
#include "AnalogSensor.h"
#include "DeviceButton.h"


enum class LightCondition {
    //% block="dark"
    Dark = ANALOG_THRESHOLD_LOW,
    //% block="bright"
    Bright = ANALOG_THRESHOLD_HIGH
};

namespace pxt {

class WLight {
  public:
    AnalogSensor sensor;
    WLight()
        : sensor(*lookupPin(PIN_LIGHT), DEVICE_ID_LIGHT_SENSOR) //
    {
        sensor.init();
        sensor.setPeriod(50);
        sensor.setSensitivity(868);
        sensor.setLowThreshold(128);
        sensor.setHighThreshold(896);
    }
};
SINGLETON(WLight);

}

namespace input {

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

/**
* Sets the light threshold value for the event
*/
//% blockId=lightsensor_set_threshold block="light set threshold %condition|to %value"
//% parts="lightsensor" advanced=true
//% weight=2
//% value.min=1 value.max=255
void setLightThreshold(LightCondition condition, int value) {
    int v = value * 4;
    if (condition == LightCondition::Dark)
        getWLight()->sensor.setLowThreshold(v);
    else
        getWLight()->sensor.setHighThreshold(v);
}
}

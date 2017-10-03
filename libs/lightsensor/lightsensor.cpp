#include "pxt.h"
#include "AnalogSensor.h"


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
* Register an event that runs when light conditions (darker or brighter) change.
* @param condition the condition that event triggers on
*/
//% help=input/on-light-condition-changed
//% blockId=input_on_light_condition_changed block="on light %condition"
//% parts="lightsensor"
//% weight=84 blockGap=8
void onLightConditionChanged(LightCondition condition, Action handler) {
    auto sensor = &getWLight()->sensor;
    sensor->updateSample();
    registerWithDal(sensor->id, (int)condition, handler);
}

/**
 * Read the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
 */
//% help=input/light-level
//% blockId=device_get_light_level block="light level"
//% parts="lightsensor"
//% weight=30 blockGap=8
int lightLevel() {
    // 0...1023
    int value = getWLight()->sensor.getValue();
    return value / 4;
}

/**
* Set the threshold value for the light condition event.
*/
//% help=input/set-light-threshold
//% blockId=lightsensor_set_threshold block="set %condition| light threshold to %value"
//% parts="lightsensor"
//% value.min=1 value.max=255
//% weight=13 blockGap=8
void setLightThreshold(LightCondition condition, int value) {
    int v = value * 4;
    if (condition == LightCondition::Dark)
        getWLight()->sensor.setLowThreshold(v);
    else
        getWLight()->sensor.setHighThreshold(v);
}
}

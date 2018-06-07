#include "pxt.h"

#ifndef CODAL_LIGHT_SENSOR_HEADER
#define CODAL_LIGHT_SENSOR_HEADER "AnalogSensor.h"
#endif

#include CODAL_LIGHT_SENSOR_HEADER

#ifndef CODAL_LIGHT_SENSOR
#define CODAL_LIGHT_SENSOR AnalogSensor
#endif

enum class LightCondition {
    //% block="dark"
    Dark = ANALOG_THRESHOLD_LOW,
    //% block="bright"
    Bright = ANALOG_THRESHOLD_HIGH
};

namespace pxt {

class WLight {
  public:
    CODAL_LIGHT_SENSOR sensor;
    WLight()
        : sensor(*LOOKUP_PIN(LIGHT), DEVICE_ID_LIGHT_SENSOR) //
    {
        sensor.init();
        sensor.setPeriod(50);
        sensor.setSensitivity(LIGHTSENSOR_SENSITIVITY); 
        sensor.setLowThreshold(LIGHTSENSOR_LOW_THRESHOLD);
        sensor.setHighThreshold(LIGHTSENSOR_HIGH_THRESHOLD);
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
//% weight=84 blockGap=12
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
//% group="More" weight=13 blockGap=8
void setLightThreshold(LightCondition condition, int value) {
    int v = value * 4;
    if (condition == LightCondition::Dark)
        getWLight()->sensor.setLowThreshold(v);
    else
        getWLight()->sensor.setHighThreshold(v);
}
}

#include "pxt.h"
#include "AnalogSensor.h"

#ifdef CODAL_LIGHT_SENSOR_HEADER
#include CODAL_LIGHT_SENSOR_HEADER
#endif


#ifndef CODAL_LIGHT_SENSOR
#define CODAL_LIGHT_SENSOR AnalogSensor
#endif

#ifndef LIGHTSENSOR_SENSITIVITY
#define LIGHTSENSOR_SENSITIVITY 868 // codal has 912 now
#endif

#ifndef LIGHTSENSOR_LOW_THRESHOLD
#define LIGHTSENSOR_LOW_THRESHOLD 128
#endif

#ifndef LIGHTSENSOR_HIGH_THRESHOLD
#define LIGHTSENSOR_HIGH_THRESHOLD 896
#endif

enum class LightCondition {
    //% block="dark"
    Dark = SENSOR_THRESHOLD_LOW,
    //% block="bright"
    Bright = SENSOR_THRESHOLD_HIGH
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
SINGLETON_IF_PIN(WLight, LIGHT);

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
    auto wlight = getWLight();
    if (NULL == wlight) return;    
    auto sensor = wlight->sensor;

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
    auto wlight = getWLight();
    if (NULL == wlight) return 127;
    auto sensor = wlight->sensor;
    // 0...1023
    int value = sensor.getValue();
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
    auto wlight = getWLight();
    if (NULL == wlight) return;
    auto sensor = wlight->sensor;

    int v = value * 4;
    if (condition == LightCondition::Dark)
        wlight->sensor.setLowThreshold(v);
    else
        wlight->sensor.setHighThreshold(v);
}
}

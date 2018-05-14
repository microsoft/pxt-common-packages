#include "pxt.h"
#include "AnalogSensor.h"
#include "NonLinearAnalogSensor.h"
#include "Button.h"


#ifndef CODAL_THERMOMETER_INCLUDE
#include CODAL_THERMOMETERR_INCLUDE
#endif

#ifndef CODAL_THERMOMETER
#define CODAL_THERMOMETER codal::NonLinearAnalogSensor
#endif


enum class TemperatureCondition {
    //% block="hot"
    Hot = ANALOG_THRESHOLD_HIGH,
    //% block="cold"
    Cold = ANALOG_THRESHOLD_LOW
};

enum class TemperatureUnit {
    //% block="°C"
    Celsius,
    //% block="°F"
    Fahrenheit
};

namespace pxt {

// Wrapper classes
class WTemp {
  public:
    CODAL_THERMOMETER sensor;
    WTemp()
        : sensor(*LOOKUP_PIN(TEMPERATURE), DEVICE_ID_THERMOMETER,
                TEMPERATURE_NOMINAL_VALUE, 
                TEMPERATURE_NOMINAL_READING, 
                TEMPERATURE_BETA, 
                TEMPERATURE_SERIES_RESISTOR,
                TEMPERATURE_ZERO_OFFSET)
    {
        sensor.init();
    }
};
SINGLETON(WTemp);

}

namespace input {

/**
* Run some code when the temperature changes from hot to cold, or from cold to hot.
* @param condition the condition, hot or cold, the event triggers on
* @param temperature the temperature at which this event happens, eg: 15
* @param unit the unit of the temperature
*/
//% blockId=input_on_temperature_condition_changed block="on temperature %condition|at %temperature|%unit"
//% parts="thermometer"
//% help=input/on-temperature-condition-changed blockExternalInputs=0
//% group="More" weight=76
void onTemperatureConditionChanged(TemperatureCondition condition, int temperature, TemperatureUnit unit, Action handler) {
    auto sensor = &getWTemp()->sensor;
    sensor->updateSample();

    int t = unit == TemperatureUnit::Celsius ? temperature : ((temperature - 32) * 10) / 18;

    if (condition == TemperatureCondition::Cold)
        sensor->setLowThreshold(t);
    else
        sensor->setHighThreshold(t);
    registerWithDal(sensor->id, (int)condition, handler);
}

/**
 * Get the temperature in Celsius or Fahrenheit degrees.
 */
//% help=input/temperature
//% blockId=device_temperature block="temperature in %unit"
//% parts="thermometer"
//% weight=26
int temperature(TemperatureUnit unit) {
    int value = getWTemp()->sensor.getValue();
    if (unit == TemperatureUnit::Celsius) return value;
    else return (value * 18) / 10 + 32;
}
}

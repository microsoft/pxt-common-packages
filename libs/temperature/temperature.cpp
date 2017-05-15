#include "pxt.h"
#include "DeviceSystemTimer.h"
#include "AnalogSensor.h"
#include "NonLinearAnalogSensor.h"
#include "DeviceButton.h"

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

}

namespace input {

/**
* Run some code when the temperature changes from hot to cold, or from cold to hot.
* @param condition the condition, hot or cold, the event triggers on
* @param temperature the temperature, in degree Celsius, at which this event happens, eg: 15
*/
//% blockId=input_on_temperature_condition_changed block="on temperature %condition|at (°C)%temperature"
//% parts="thermometer" weight=95 blockGap=8 advanced=true
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
 * Get the temperature in Celsius or Fahrenheit degrees.
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
}

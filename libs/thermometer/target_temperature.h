#include "NonLinearAnalogSensor.h"

/*
 * @param nominalValue The value (in SI units) of a nominal position.
 * @param nominalReading The raw reading from the sensor at the nominal position.
 * @param beta The Steinhart-Hart Beta constant for the device
 * @param seriesResistor The value (in ohms) of the resistor in series with the sensor.
 * @param zeroOffset Optional zero offset applied to all SI units (e.g. 273.15 for temperature
 * sensing in C vs Kelvin).
 */

#ifndef TEMPERATURE_NOMINAL_VALUE
#define TEMPERATURE_NOMINAL_VALUE 25
#endif

#ifndef TEMPERATURE_NOMINAL_READING
#define TEMPERATURE_NOMINAL_READING 10000
#endif

#ifndef TEMPERATURE_BETA
#define TEMPERATURE_BETA 3380
#endif

#ifndef TEMPERATURE_SERIES_RESISTOR
#define TEMPERATURE_SERIES_RESISTOR 10000
#endif

#ifndef TEMPERATURE_ZERO_OFFSET
#define TEMPERATURE_ZERO_OFFSET 273.5
#endif

namespace pxt {
class WTemp {
  public:
    NonLinearAnalogSensor sensor;
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
}
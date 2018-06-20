#include "NonLinearAnalogSensor.h"

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
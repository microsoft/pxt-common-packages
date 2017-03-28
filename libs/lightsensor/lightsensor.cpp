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
}

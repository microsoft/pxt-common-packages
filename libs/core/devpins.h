#ifndef __PXT_DEV_PINS_H
#define __PXT_DEV_PINS_H

#include "pins.h"

class DevPins {
  public:
    DevicePin pins[0];
#define DigitalPin DevicePin
#define AnalogPin DevicePin
#define PwmPin DevicePin
    //% indexedInstanceNS=pins indexedInstanceShim=pxt::getPin
    //%
    AnalogPin A0;
    //%
    AnalogPin A1;
    //%
    AnalogPin A2;
    //%
    AnalogPin A3;
    //%
    AnalogPin A4;
    //%
    AnalogPin A5;
    //%
    AnalogPin A6;
    //%
    AnalogPin A7;
    //%
    PwmPin A8;
    //%
    PwmPin A9;
    //%
    PwmPin A10;
    //%
    PwmPin A11;
    //%
    DigitalPin D0;
    //%
    DigitalPin D1;
    //%
    DigitalPin D2;
    //%
    DigitalPin D3;
    //%
    DigitalPin D4;
    //%
    DigitalPin D5;
    //%
    DigitalPin D6;
    //%
    DigitalPin D7;
    //%
    DigitalPin D8;
    //%
    DigitalPin D9;
    //%
    DigitalPin D10;
    //%
    DigitalPin D11;
    //%
    DigitalPin D12;
    //%
    DigitalPin D13;
    //%
    DigitalPin LED;
    //%
    DigitalPin LEDRX;
    //%
    DigitalPin LEDTX;
#undef DigitalPin
#undef AnalogPin
#undef PwmPin

    I2C i2c;
    SPI spi;

    DevPins();
};

extern DevPins *io;

// modify if the last field changes
const int LastPinID = &io->LEDTX - io->pins;

#endif
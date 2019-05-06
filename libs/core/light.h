#ifndef __PXT_LIGHT_H
#define __PXT_LIGHT_H

#include "pxt.h"

namespace light {
    /**
    * Clear onboard neopixels
    */
    void clear();

    /**
    * Send a programmable light buffer to the specified digital pin
    * @param data The pin that the light are connected to
    * @param clk the clock line if nay
    * @param mode the color encoding mode
    * @param buf The buffer to send to the pin
    */
    //%
    void sendBuffer(DigitalInOutPin data, DigitalInOutPin clk, int mode, Buffer buf);

    void neopixelSendData(DevicePin* pin, int mode, const uint8_t* data, unsigned length);
}

#endif
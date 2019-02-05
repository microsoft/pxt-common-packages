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
    * @param pin The pin that the light are connected to
    * @param mode the color encoding mode
    * @param buf The buffer to send to the pin
    */
    //% parts="neopixel"
    void sendBuffer(DigitalInOutPin pin, int mode, Buffer buf);

    void sendData(DevicePin* pin, int mode, const uint8_t* data, unsigned length);

    /**
    * Sends a single color to a single onboard LED programmable light
    */
    //%
    void sendPixelBuffer(Buffer buf);
}

#endif
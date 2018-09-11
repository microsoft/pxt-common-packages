#include "pxt.h"
#include <cstdint>
#include <math.h>

using namespace pxt;

// v0 backward compat support
#ifndef PXT_BUFFER_DATA
#define PXT_BUFFER_DATA(buffer) buffer->payload
#endif

namespace bme280 {

/*
 * Compensates the pressure value read from the register.  This done in C++ because
 * it requires the use of 64-bit signed integers which isn't provided in TypeScript
 */
//%
uint32_t compensatePressure(int32_t pressRegVal, int32_t tFine, Buffer compensation) {
    // Compensation Values
    uint16_t digP1;
    int16_t digP2;
    int16_t digP3;
    int16_t digP4;
    int16_t digP5;
    int16_t digP6;
    int16_t digP7;
    int16_t digP8;
    int16_t digP9;

    // Unpack the compensation data
    auto ptr = PXT_BUFFER_DATA(compensation);
    memcpy((uint8_t *)&digP1, ptr + 0, 2);
    memcpy((uint8_t *)&digP2, ptr + 2, 2);
    memcpy((uint8_t *)&digP3, ptr + 4, 2);
    memcpy((uint8_t *)&digP4, ptr + 6, 2);
    memcpy((uint8_t *)&digP5, ptr + 8, 2);
    memcpy((uint8_t *)&digP6, ptr + 10, 2);
    memcpy((uint8_t *)&digP7, ptr + 12, 2);
    memcpy((uint8_t *)&digP8, ptr + 14, 2);
    memcpy((uint8_t *)&digP9, ptr + 16, 2);

    // Do the compensation
    int64_t firstConv = ((int64_t)tFine) - 12800;
    int64_t secondConv = firstConv * firstConv * (int64_t)digP6;
    secondConv = secondConv + ((firstConv * (int64_t)digP5) << 17);
    secondConv = secondConv + (((int64_t)digP4) << 35);
    firstConv =
        ((firstConv * firstConv * (int64_t)digP3) >> 8) + ((firstConv * (int64_t)digP2) << 12);
    firstConv = (((((int64_t)1) << 47) + firstConv)) * ((int64_t)digP1) >> 33;
    if (firstConv == 0) {
        return 0; // avoid exception caused by division by zero
    }
    int64_t p = 1048576 - pressRegVal;
    p = (((p << 31) - secondConv) * 3125) / firstConv;
    firstConv = (((int64_t)digP9) * (p >> 13) * (p >> 13)) >> 25;
    secondConv = (((int64_t)digP8) * p) >> 19;
    p = ((p + firstConv + secondConv) >> 8) + (((int64_t)digP7) << 4);
    return (uint32_t)p;
}

/*
 * calculates the Altitude based on pressure.
 */
//%
uint32_t calcAltitude(int32_t pressRegVal, int32_t tFine, Buffer compensation) {

    return 44330 *
           (1 - pow(((compensatePressure(pressRegVal, tFine, compensation) / 25600) / 1013.25),
                    0.1903));
}
} // namespace bme280
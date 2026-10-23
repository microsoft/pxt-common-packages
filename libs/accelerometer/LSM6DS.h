#ifndef __PXT_LSM6DS_H
#define __PXT_LSM6DS_H

#include "Accelerometer.h"
#include "I2C.h"
#include "CoordinateSystem.h"

#define LSM6DS_WHOAMI 0x0F
#define LSM6DS_CTRL1_XL 0x10
#define LSM6DS_CTRL3_C 0x12
#define LSM6DS_STATUS_REG 0x1E
#define LSM6DS_OUTX_L_XL 0x28

namespace pxt {

/**
 * Accelerometer driver for the ST LSM6DS family of IMUs (LSM6DS3, LSM6DS3TR-C,
 * LSM6DSL, LSM6DSM, LSM6DSO/LSM6DSOX), e.g. on the Pimoroni Tufty 2350.
 * Only the accelerometer is used; data is polled when the scheduler is idle,
 * so no interrupt pin is required.
 */
class LSM6DS : public codal::Accelerometer {
    codal::I2C &i2c;
    uint16_t address;

  public:
    LSM6DS(codal::I2C &i2c, codal::CoordinateSpace &coordinateSpace, uint16_t address,
           uint16_t id = DEVICE_ID_ACCELEROMETER);

    /**
     * Checks the WHO_AM_I register for a known LSM6DS family id.
     * @param address 8-bit I2C address
     */
    static bool isDetected(codal::I2C &i2c, uint16_t address);

    virtual int configure() override;
    virtual int requestUpdate() override;
    virtual void idleCallback() override;
    virtual int setSleep(bool sleepMode);
};

} // namespace pxt

#endif

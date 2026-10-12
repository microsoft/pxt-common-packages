#include "pxt.h"

#ifndef PXT_SUPPORT_LSM6DS
#define PXT_SUPPORT_LSM6DS 0
#endif

#if PXT_SUPPORT_LSM6DS

#include "CodalDmesg.h"
#include "LSM6DS.h"

namespace pxt {

struct LSM6DSRate {
    uint16_t periodMs;
    uint8_t odr; // ODR_XL bits [7:4] of CTRL1_XL
};

// slowest first
static const LSM6DSRate lsm6dsRates[] = {
    {80, 0x1}, // 12.5 Hz
    {38, 0x2}, // 26 Hz
    {19, 0x3}, // 52 Hz
    {9, 0x4},  // 104 Hz
    {4, 0x5},  // 208 Hz
    {2, 0x6},  // 416 Hz
    {1, 0x7},  // 833 Hz
};

LSM6DS::LSM6DS(codal::I2C &i2c, codal::CoordinateSpace &coordinateSpace, uint16_t address,
               uint16_t id)
    : codal::Accelerometer(coordinateSpace, id), i2c(i2c), address(address) {
    status |= DEVICE_COMPONENT_STATUS_IDLE_TICK;
}

bool LSM6DS::isDetected(codal::I2C &i2c, uint16_t address) {
    uint8_t data = 0;
    if (i2c.readRegister(address, LSM6DS_WHOAMI, &data, 1) != DEVICE_OK)
        return false;
    // 0x69: LSM6DS3, 0x6A: LSM6DS3TR-C/LSM6DSL/LSM6DSM, 0x6B: LSM6DSR, 0x6C: LSM6DSO/LSM6DSOX
    return data >= 0x69 && data <= 0x6C;
}

int LSM6DS::configure() {
    // FS_XL bits [3:2] of CTRL1_XL: 00 = 2g, 10 = 4g, 11 = 8g, 01 = 16g
    uint8_t fs;
    if (sampleRange <= 2) {
        sampleRange = 2;
        fs = 0x00;
    } else if (sampleRange <= 4) {
        sampleRange = 4;
        fs = 0x08;
    } else if (sampleRange <= 8) {
        sampleRange = 8;
        fs = 0x0C;
    } else {
        sampleRange = 16;
        fs = 0x04;
    }

    // pick the slowest output data rate that is at least as fast as requested
    const LSM6DSRate *rate = &lsm6dsRates[sizeof(lsm6dsRates) / sizeof(lsm6dsRates[0]) - 1];
    for (auto &r : lsm6dsRates) {
        if (samplePeriod >= r.periodMs) {
            rate = &r;
            break;
        }
    }
    samplePeriod = rate->periodMs;

    // BDU (block data update) | IF_INC (auto-increment register address)
    if (i2c.writeRegister(address, LSM6DS_CTRL3_C, 0x44) != DEVICE_OK)
        return DEVICE_I2C_ERROR;
    if (i2c.writeRegister(address, LSM6DS_CTRL1_XL, (rate->odr << 4) | fs) != DEVICE_OK)
        return DEVICE_I2C_ERROR;

    DMESG("LSM6DS init: range=%dg period=%dms", sampleRange, samplePeriod);
    return DEVICE_OK;
}

int LSM6DS::requestUpdate() {
    status |= DEVICE_COMPONENT_STATUS_IDLE_TICK;

    uint8_t st;
    if (i2c.readRegister(address, LSM6DS_STATUS_REG, &st, 1) != DEVICE_OK)
        return DEVICE_I2C_ERROR;
    if (!(st & 0x01)) // XLDA: no new accelerometer data
        return DEVICE_OK;

    uint8_t data[6];
    if (i2c.readRegister(address, LSM6DS_OUTX_L_XL, data, 6) != DEVICE_OK)
        return DEVICE_I2C_ERROR;

    int16_t x = (int16_t)(data[0] | (data[1] << 8));
    int16_t y = (int16_t)(data[2] | (data[3] << 8));
    int16_t z = (int16_t)(data[4] | (data[5] << 8));

    // full scale (+/- sampleRange g) maps to +/- 32768; convert to milli-g
    int scale = sampleRange * 1000;
    sampleENU.x = (int)x * scale / 32768;
    sampleENU.y = (int)y * scale / 32768;
    sampleENU.z = (int)z * scale / 32768;

    update();
    return DEVICE_OK;
}

void LSM6DS::idleCallback() {
    requestUpdate();
}

int LSM6DS::setSleep(bool sleepMode) {
    if (sleepMode)
        return i2c.writeRegister(address, LSM6DS_CTRL1_XL, 0x00); // power down
    return configure();
}

} // namespace pxt

#endif // PXT_SUPPORT_LSM6DS

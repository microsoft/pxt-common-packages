// This supports a few different accelerometers.
// If desired, overrides PXT_SUPPORT_* in platform.h (note that only LIS3DH is on by default).
// Then accelerometer can be changed with config.ACCELEROMETER_TYPE in TypeScript.
// This file can be overridden alltogether by a target if a different accelerometer is desired.

#include "pxt.h"
#include "axis.h"
#include "Pin.h"
#include "I2C.h"
#include "CoordinateSystem.h"
#include "CodalDmesg.h"

#ifndef PXT_DEFAULT_ACCELEROMETER
#define PXT_DEFAULT_ACCELEROMETER -1
#endif

#ifndef PXT_SUPPORT_LIS3DH
#define PXT_SUPPORT_LIS3DH 1
#endif
#if PXT_SUPPORT_LIS3DH
#include "LIS3DH.h"
#endif

#ifndef PXT_SUPPORT_MMA8653
#define PXT_SUPPORT_MMA8653 0
#endif
#if PXT_SUPPORT_MMA8653
#include "MMA8653.h"
#endif

#ifndef PXT_SUPPORT_MMA8453
#define PXT_SUPPORT_MMA8453 0
#endif
#if PXT_SUPPORT_MMA8453
#include "MMA8453.h"
#endif

#ifndef PXT_SUPPORT_FXOS8700
#define PXT_SUPPORT_FXOS8700 0
#endif
#if PXT_SUPPORT_FXOS8700
#include "FXOS8700Accelerometer.h"
#endif

#ifndef PXT_SUPPORT_MSA300
#define PXT_SUPPORT_MSA300 0
#endif
#if PXT_SUPPORT_MSA300
#include "MSA300.h"
#endif

#ifndef PXT_SUPPORT_MPU6050
#define PXT_SUPPORT_MPU6050 0
#endif
#if PXT_SUPPORT_MPU6050
#include "MPU6050.h"
#endif

#if defined(CODAL_ACCELEROMETER)
#error "please define PXT_SUPPORT_*"
#endif

namespace pxt {

    /*
RAW,                            0x000000
SIMPLE_CARTESIAN,               0x000001
NORTH_EAST_DOWN,                0x000002
NORTH_EAST_UP                   0x000003

COORDINATE_SPACE_ROTATED_0      0x000000
COORDINATE_SPACE_ROTATED_90     0x000010
COORDINATE_SPACE_ROTATED_180    0x000020
COORDINATE_SPACE_ROTATED_270    0x000030

NOT_UPSIDE_DOWN                 0x000000
UPSIDE_DOWN                     0x000100
    */

static CoordinateSpace boardCoordinateSpace() {
    int defaultSpace = ((int)ACC_SYSTEM) | ((int)ACC_ROTATION << 4) | (ACC_UPSIDEDOWN ? 0x100 : 0x000);
#if defined(STM32F4) && PXT_SUPPORT_MPU6050
    // meowbit
    if (getConfig(CFG_ACCELEROMETER_TYPE, -1) == ACCELEROMETER_TYPE_MPU6050)
        defaultSpace = 0x33 | 0x100; // ACC_UPSIDEDOWN
#endif
    int space = getConfig(CFG_ACCELEROMETER_SPACE, defaultSpace);
    DMESG("coordinate space: %d / %d, %s", space & 0xf, (space >> 4) & 0xf, space & 0x100 ? "upside" : "normal");
    return CoordinateSpace((CoordinateSystem)(space & 0xf), !!(space & 0x100), (space >> 4) & 0xf);
}

// Wrapper classes
class WAccel {
    CoordinateSpace space;
		
  public:
    Accelerometer *acc;
    WAccel() 
    : space(boardCoordinateSpace())
    , acc(NULL) {
        DMESG("acc: mounting");
        auto sda = LOOKUP_PIN(ACCELEROMETER_SDA);
        auto scl = LOOKUP_PIN(ACCELEROMETER_SCL);
        if (NULL == sda || NULL == scl) { // use default i2c instead
            DMESG("acc: using SDA, SCL");
            sda = LOOKUP_PIN(SDA);
            scl = LOOKUP_PIN(SCL);
        }
        codal::I2C* i2c = pxt::getI2C(sda, scl);
        if (NULL == i2c) {
            DMESG("acc: no i2c available");
            return;
        }
		
        int accType = getConfig(CFG_ACCELEROMETER_TYPE, PXT_DEFAULT_ACCELEROMETER);
        acc = instantiateAccelerometer(accType, i2c);
        if (NULL == acc) {
            int accDetect = detectAccelerometer(i2c);
            if (accDetect < 0) {
                DMESG("acc: not detected");
            } else {
                DMESG("acc: detected %d", accDetect);
                acc = instantiateAccelerometer(accDetect, i2c);
            }
        }

        if (NULL == acc) {
            // the accelerometer might be damaged or incorrectly configured,
            // in doubt, we just ignore it            
            if (LOOKUP_PIN(ACCELEROMETER_SDA))
                DMESG("acc: damaged accelereomter or invalid ACCELEROMETER_TYPE");
            else
                DMESG("acc: invalid ACCELEROMETER_TYPE");
            // acc is already NULL, do nothing
        }
        else {
            // acc->init(); - doesn't do anything
            acc->configure();
            acc->requestUpdate();
            DMESG("acc: mounted");
        }
    }

private:

	int detectAccelerometer(codal::I2C* i2c){
		uint8_t data;
		int result;

#if PXT_SUPPORT_LIS3DH
		result = i2c->readRegister(ACCELEROMETER_TYPE_LIS3DH, LIS3DH_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_LIS3DH;
		result = i2c->readRegister(ACCELEROMETER_TYPE_LIS3DH_ALT, LIS3DH_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_LIS3DH_ALT;
#endif
			
#if PXT_SUPPORT_MMA8453
		result = i2c->readRegister(ACCELEROMETER_TYPE_MMA8453, MMA8653_WHOAMI/*MMA8453 is similar to MMA8653*/ , &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MMA8453;
#endif

#if PXT_SUPPORT_FXOS8700
		result = i2c->readRegister(ACCELEROMETER_TYPE_FXOS8700, FXOS8700_WHO_AM_I, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_FXOS8700;
#endif
		
#if PXT_SUPPORT_MMA8653
		result = i2c->readRegister(ACCELEROMETER_TYPE_MMA8653,  MMA8653_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MMA8653;	
#endif
		
#if PXT_SUPPORT_MSA300
		result = i2c->readRegister(ACCELEROMETER_TYPE_MSA300, MSA300_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MSA300;	
#endif
			
#if PXT_SUPPORT_MPU6050
		result = i2c->readRegister(ACCELEROMETER_TYPE_MPU6050, MPU6050_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MPU6050;	
#endif 

		return -1;
	}

    codal::Accelerometer* instantiateAccelerometer(int accType, codal::I2C* i2c) {
        switch (accType) {
#if PXT_SUPPORT_LIS3DH
        case ACCELEROMETER_TYPE_LIS3DH:
        case ACCELEROMETER_TYPE_LIS3DH_ALT:
            return new LIS3DH(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space, accType);
#endif
#if PXT_SUPPORT_MSA300
        case ACCELEROMETER_TYPE_MSA300:
            return new MSA300(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
#endif
#if PXT_SUPPORT_FXOS8700
        case ACCELEROMETER_TYPE_FXOS8700: {
            // TODO: singleton when exposing gyro
            auto fox = new FXOS8700(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT));
            return new FXOS8700Accelerometer(*fox, space);
        }
#endif
#if PXT_SUPPORT_MMA8653
        case ACCELEROMETER_TYPE_MMA8653:
            return new MMA8653(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
#endif
#if PXT_SUPPORT_MMA8453
        case ACCELEROMETER_TYPE_MMA8453:
            return new MMA8453(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
#endif
#if PXT_SUPPORT_MPU6050
        case ACCELEROMETER_TYPE_MPU6050:
            return new MPU6050(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
#endif
        default:
            return NULL;
        }
    }

};

SINGLETON_IF_PIN(WAccel, ACCELEROMETER_INT);

codal::Accelerometer *getAccelerometer() {
    auto wacc = getWAccel();
    return wacc ? wacc->acc : NULL;
}

} // namespace pxt

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

// Wrapper classes
class WAccel {
    CoordinateSpace space;
		
  public:
    Accelerometer *acc;
    WAccel() : space(ACC_SYSTEM, ACC_UPSIDEDOWN, ACC_ROTATION), acc(NULL) {
        DMESG("ACCEL: mounting");
        auto sda = LOOKUP_PIN(ACCELEROMETER_SDA);
        auto scl = LOOKUP_PIN(ACCELEROMETER_SCL);
        if (NULL == sda || NULL == scl) { // use default i2c instead
            DMESG("accelerometer: using SDA, SCL");
            sda = LOOKUP_PIN(SDA);
            scl = LOOKUP_PIN(SCL);
        }
        codal::I2C* i2c = pxt::getI2C(sda, scl);
        if (!i2c) {
            DMESG("accelerometer: no i2c available");
            return;
        }
		
        int accType = getConfig(CFG_ACCELEROMETER_TYPE, PXT_DEFAULT_ACCELEROMETER);
        auto acc = instantiateAccelerometer(accType);
        if (NULL == acc) {
            int accDetect = detectAccelerometer(*i2c);
            DMESG("accelerometer: detected %d", accDetect);
            accType = getConfig(CFG_ACCELEROMETER_TYPE, accDetect);
            acc = instantiateAccelerometer(accType);
        }

        if (NULL == acc) {
            if (LOOKUP_PIN(ACCELEROMETER_SDA))
                target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);
            else
                DMESG("acc: invalid ACCELEROMETER_TYPE");
        }
        else {
            // acc->init(); - doesn't do anything
            acc->configure();
            acc->requestUpdate();
        }
    }

private:

	int detectAccelerometer(codal::I2C& i2c){
		uint8_t data;
		int result;

#if PXT_SUPPORT_LIS3DH
		result = i2c.readRegister(ACCELEROMETER_TYPE_LIS3DH, LIS3DH_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_LIS3DH;
#endif
			
#if PXT_SUPPORT_MMA8453
		result = i2c.readRegister(ACCELEROMETER_TYPE_MMA8453, MMA8653_WHOAMI/*MMA8453 is similar to MMA8653*/ , &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MMA8453;
#endif

#if PXT_SUPPORT_FXOS8700
		result = i2c.readRegister(ACCELEROMETER_TYPE_FXOS8700, FXOS8700_WHO_AM_I, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_FXOS8700;
#endif
		
#if PXT_SUPPORT_MMA8653
		result = i2c.readRegister(ACCELEROMETER_TYPE_MMA8653,  MMA8653_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MMA8653;	
#endif
		
#if PXT_SUPPORT_MSA300
		result = i2c.readRegister(ACCELEROMETER_TYPE_MSA300, MSA300_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MSA300;	
#endif
			
#if PXT_SUPPORT_MPU6050
		result = i2c.readRegister(ACCELEROMETER_TYPE_MPU6050, MPU6050_WHOAMI, &data, 1);
		if (result ==0)
			return ACCELEROMETER_TYPE_MPU6050;	
#endif 

		return PXT_DEFAULT_ACCELEROMETER;
	}

    codal::Accelerometer* instantiateAccelerometer(int accType) {
        codal::Accelerometer* acc = NULL;
        switch (accType) {
#if PXT_SUPPORT_LIS3DH
        case ACCELEROMETER_TYPE_LIS3DH:
            acc = new LIS3DH(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
            break;
#endif
#if PXT_SUPPORT_MSA300
        case ACCELEROMETER_TYPE_MSA300:
            acc = new MSA300(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
            break;
#endif
#if PXT_SUPPORT_FXOS8700
        case ACCELEROMETER_TYPE_FXOS8700: {
            // TODO: singleton when exposing gyro
            auto fox = new FXOS8700(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT));
            acc = new FXOS8700Accelerometer(*fox, space);
            break;
        }
#endif
#if PXT_SUPPORT_MMA8653
        case ACCELEROMETER_TYPE_MMA8653:
            acc = new MMA8653(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
            break;
#endif
#if PXT_SUPPORT_MMA8453
        case ACCELEROMETER_TYPE_MMA8453:
            acc = new MMA8453(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
            break;
#endif
#if PXT_SUPPORT_MPU6050
        case ACCELEROMETER_TYPE_MPU6050:
            acc = new MPU6050(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
            break;
#endif
        }
        return acc;
    }

};

SINGLETON_IF_PIN(WAccel, ACCELEROMETER_INT);

codal::Accelerometer *getAccelerometer() {
    auto wacc = getWAccel();
    return wacc ? wacc->acc : NULL;
}

} // namespace pxt

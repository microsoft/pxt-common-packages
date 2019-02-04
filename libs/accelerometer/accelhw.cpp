// This supports a few different accelerometers.
// If desired, overrides PXT_SUPPORT_* in platform.h (note that only LIS3DH is on by default).
// Then accelerometer can be changed with config.ACCELEROMETER_TYPE in TypeScript.
// This file can be overridden alltogether by a target if a different accelerometer is desired.

#include "pxt.h"
#include "axis.h"
#include "Pin.h"
#include "I2C.h"
#include "CoordinateSystem.h"

#ifndef PXT_DEFAULT_ACCELEROMETER
#define PXT_DEFAULT_ACCELEROMETER ACCELEROMETER_TYPE_LIS3DH
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

#if defined(CODAL_ACCELEROMETER)
#error "please define PXT_SUPPORT_* and PXT_DEFUALT_ACCELEROMETER"
#endif

namespace pins {
CODAL_I2C *getI2C();
}

namespace pxt {

// Wrapper classes
class WAccel {
    CoordinateSpace space;

  public:
    Accelerometer *acc;
    WAccel() : space(ACC_SYSTEM, ACC_UPSIDEDOWN, ACC_ROTATION) {
        CODAL_I2C *i2c;
        if (PIN(ACCELEROMETER_SDA) == (PinName)-1 || PIN(ACCELEROMETER_SDA) == PIN(SDA)) {
            i2c = pins::i2c();
        } else {
            i2c = new CODAL_I2C(*LOOKUP_PIN(ACCELEROMETER_SDA), *LOOKUP_PIN(ACCELEROMETER_SCL));
        }

        auto accType = getConfig(CFG_ACCELEROMETER_TYPE, PXT_DEFAULT_ACCELEROMETER);
        acc = NULL;
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
        case ACCELEROMETER_TYPE_FXOS8700:
            acc = new FXOS8700Accelerometer(*i2c, *LOOKUP_PIN(ACCELEROMETER_INT), space);
            break;
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
        }

        if (acc == NULL)
            target_panic(PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR);

        // acc->init(); - doesn't do anything
        acc->configure();
        acc->requestUpdate();
    }
};
SINGLETON(WAccel);

codal::Accelerometer *getAccelerometer() {
    return getWAccel()->acc;
}

} // namespace pxt

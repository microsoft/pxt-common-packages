#ifndef __PXT_PLATFORM_H
#define __PXT_PLATFORM_H

#define PAGE_SIZE 1024 // not really

#define DEV_NUM_PINS 28

#define DEV_PWM_PINS 0xffffffffULL
#define DEV_AIN_PINS 0ULL

// Codal doesn't yet distinguish between PWM and AIN
#define DEV_ANALOG_PINS (DEV_PWM_PINS | DEV_AIN_PINS)

#define CODAL_PIN ZPin
#define CODAL_TIMER ZTimer
#define CODAL_SPI ZSPI
#define CODAL_I2C ZI2C

const char *vm_settings_dir(void);
#define SETTINGSDIR vm_settings_dir()

namespace pxt {

class ZPin;
class AbstractButton;
class MultiButton;
class CodalComponent;

typedef void (*reset_fn_t)();
void registerResetFunction(reset_fn_t fn);
void soft_panic(int errorCode);
} // namespace pxt

#define IMAGE_BITS 4

#define PXT_IN_ISR() false

#define GC_BLOCK_SIZE (1024 * 64)

#define PXT_REGISTER_RESET(fn) pxt::registerResetFunction(fn)

#ifdef __APPLE__
#include "TargetConditionals.h"
#if TARGET_OS_IPHONE
#define PXT_IOS 1
#endif
#endif

#if defined(PXT64) || defined(__MINGW32__)
#define GC_BASE 0x2000000000
#define GC_PAGE_SIZE (64 * 1024)

// always allocate 1M of heap
#define PXT_VM_HEAP_ALLOC_BITS 20
extern uint8_t *gcBase;
#define PXT_IS_READONLY(v)                                                                         \
    (!isPointer(v) || (((uintptr_t)v - (uintptr_t)gcBase) >> PXT_VM_HEAP_ALLOC_BITS) != 0)

#else // PXT32
#define GC_BASE 0x20000000
#define GC_PAGE_SIZE 4096

#endif // PXT32 vs 64

#endif

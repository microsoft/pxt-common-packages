#ifndef __PXT_PLATFORM_H
#define __PXT_PLATFORM_H

#include "esp_timer.h"
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define PXT_ESP32 1

#define PAGE_SIZE 1024 // not really

#define DEV_NUM_PINS 40

#define DEV_PWM_PINS 0xffff_ffff_ffffULL
#define DEV_AIN_PINS 0ULL

// Codal doesn't yet distinguish between PWM and AIN
#define DEV_ANALOG_PINS (DEV_PWM_PINS | DEV_AIN_PINS)

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

// 0x3f400000-0x3f700000 range of data SPI flash
#define PXT_IS_READONLY(v) (isTagged(v) || ((uintptr_t)v >> 22) == 0xfd)

#define CODAL_PIN ::pxt::ZPin

extern "C" {
extern const uintptr_t PXT_EXPORTData[];
}

#endif

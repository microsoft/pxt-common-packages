#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"
#include "vm.h"
#include "pins.h"
#include "pintarget.h"

#define OUTPUT_BITS 12

#define DEVICE_EVT_ANY 0
#define DEVICE_ID_NOTIFY_ONE 1022
#define DEVICE_ID_NOTIFY 1023

#define CHK(call)                                                                                  \
    {                                                                                              \
        int __r = call;                                                                            \
        if (__r != 0) {                                                                            \
            DMESG("fail: %d at %d", __r, __LINE__);                                                \
            abort();                                                                               \
        }                                                                                          \
    }

namespace pxt {
void raiseEvent(int id, int event);
int allocateNotifyEvent();
void sleep_core_us(uint64_t us);

class Button;
typedef Button *Button_;

extern volatile bool paniced;
extern char **initialArgv;
void target_exit();
extern volatile int panicCode;

// Buffer, Sound, and Image share representation.
typedef Buffer Sound;


typedef struct worker *worker_t;
worker_t worker_alloc(const char *id, uint32_t stack_size);
int worker_run(worker_t w, TaskFunction_t fn, void *arg);
int worker_run_wait(worker_t w, TaskFunction_t fn, void *arg);
void worker_set_idle(worker_t w, TaskFunction_t fn, void *arg);
extern worker_t fg_worker;

void memInfo();

extern void (*logJDFrame)(const uint8_t *data);
extern void (*sendJDFrame)(const uint8_t *data);

} // namespace pxt

extern "C" void target_disable_irq();
extern "C" void target_enable_irq();
extern "C" void target_init();
extern "C" void target_wait_us(uint32_t us);

#define DEVICE_ID_JACDAC 30
#define DEVICE_ID_JACDAC_PHYS 31

#undef PXT_MAIN
#define PXT_MAIN                                                                                   \
    extern "C" int app_main() {                                                              \
        pxt::vmStart();                                                                            \
        return 0;                                                                                  \
    }

#undef PXT_SHIMS_BEGIN
#define PXT_SHIMS_BEGIN                                                                            \
    namespace pxt {                                                                                \
    const OpcodeDesc staticOpcodes[] __attribute__((aligned(0x20))) = {

#undef PXT_SHIMS_END
#define PXT_SHIMS_END                                                                              \
    { 0, 0, 0 }                                                                                    \
    }                                                                                              \
    ;                                                                                              \
    }

#endif

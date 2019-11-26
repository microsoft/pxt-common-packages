#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"

#include "vm.h"

#define OUTPUT_BITS 12

#define DEVICE_EVT_ANY 0
#define DEVICE_ID_NOTIFY_ONE 1022
#define DEVICE_ID_NOTIFY 1023

namespace pxt {
void raiseEvent(int id, int event);
int allocateNotifyEvent();
void sleep_core_us(uint64_t us);

void target_disable_irq();
void target_enable_irq();

class Button;
typedef Button *Button_;

extern "C" void target_init();

extern volatile bool paniced;
extern char **initialArgv;
void target_exit();
extern volatile int panicCode;

// Buffer, Sound, and Image share representation.
typedef Buffer Sound;

} // namespace pxt

#undef PXT_MAIN
#define PXT_MAIN                                                                                   \
    int main(int argc, char **argv) {                                                              \
        pxt::initialArgv = argv;                                                                   \
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

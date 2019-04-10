#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"
//#include "pins.h"

#include "CodalComponent.h"
#include "Event.h"
#include "vm.h"

namespace pxt {
void raiseEvent(int id, int event);
int allocateNotifyEvent();
void sleep_core_us(uint64_t us);

class Button;
typedef Button *Button_;

extern "C" void target_init();

class MMap : public RefObject {
  public:
    int length;
    int fd;
    uint8_t *data;

    MMap();
    void destroy();
    void print();
};

extern volatile bool paniced;
extern char **initialArgv;
void target_exit();

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

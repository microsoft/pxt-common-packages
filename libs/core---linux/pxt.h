#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"

#define OUTPUT_BITS 12

#define DEVICE_EVT_ANY 0
#define DEVICE_ID_NOTIFY_ONE 1022
#define DEVICE_ID_NOTIFY 1023

namespace pxt {
void raiseEvent(int id, int event);
int allocateNotifyEvent();
void sleep_core_us(uint64_t us);
void startUser();
void stopUser();

void target_disable_irq();
void target_enable_irq();

const char *getConfigString(const char *name);
int getConfigInt(const char *name, int defl);
#define ENDMARK -0x7fff0123
const int *getConfigInts(const char *name);

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

// extern Event lastEvent;
} // namespace pxt

#undef PXT_MAIN
#define PXT_MAIN                                                                                   \
    int main(int argc, char **argv) {                                                        \
        pxt::initialArgv = argv;                                                                   \
        pxt::start();                                                                              \
        return 0;                                                                                  \
    }

#endif

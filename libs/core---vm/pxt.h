#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"
//#include "pins.h"

#include "CodalComponent.h"
#include "Event.h"

namespace pxt {
void raiseEvent(int id, int event);
int allocateNotifyEvent();
void sleep_core_us(uint64_t us);
void startUser();
void stopUser();

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

struct VMFnHeader {
    uint32_t nameLiteral;
    uint32_t start;
    uint32_t size;
};

struct VMImageHeader {
    uint64_t magic0;
    uint64_t magic1;
    uint64_t hexHash;
    uint64_t programHash;

    uint32_t allocGlobals;
    uint32_t nonPointerGlobals;

    // image structure
    uint32_t totalBytes;          // in the entire image, include this header
    uint32_t numConfigData;       // 8 (int+int)
    uint32_t numIfaceMemberNames; // 4 (offset)
    uint32_t numDoubleLiterals;   // 8 (double)
    uint32_t numIntLiterals;      // 4 (int)
    uint32_t numPointerLiterals;  // 4 (offset)
    uint32_t numFunctions;        // sizeof(FnHeader)
    uint32_t reserved[20];
};

struct VMImage {
    double *doubleConst;
    int *intConst;
};

struct FiberContext {
    TValue *stackBase;
    FiberContext *next;
    FiberContext *prev;

    uint32_t *pc;
    uint32_t *img;
    TValue *sp;
    TValue r0;
    TValue *caps;
};

typedef void (*OpFun)(FiberContext *ctx, unsigned arg);

extern const OpFun opcodes[];

} // namespace pxt

#undef PXT_MAIN
#define PXT_MAIN                                                                                   \
    int main(int argc, char **argv) {                                                              \
        pxt::initialArgv = argv;                                                                   \
        pxt::start();                                                                              \
        return 0;                                                                                  \
    }

#endif

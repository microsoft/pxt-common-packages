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

/*

Image load:
* go over all sections
* construct array of section addresses
* construct opcodes[] array from OpCodeMap
* for Literal/Function sections replace the section header with VTable pointer
* validate literals (length etc)
* validate functions

*/

#define OPCODE_BASE_SIZE 7 // up to 127 base opcodes
#define OPCODE_BASE_MASK ((1 << OPCODE_BASE_SIZE) - 1)

struct FiberContext;
typedef void (*OpFun)(FiberContext *ctx, unsigned arg);
typedef void (*ApiFun)(FiberContext *ctx);

enum class SectionType {
    Invalid = 0,

    // singular sections
    InfoHeader,       // VMImageHeader
    OpCodeMap,        // \0-terminated names of opcodes and APIs (shims)
    DoubleLiterals,   // arrays of doubles
    IntLiterals,      // array of int32s
    ConfigData,       // sorted array of pairs of int32s; zero-terminated
    IfaceMemberNames, // array of 32 bit offsets, that point to string literals

    // repetitive sections
    Function,
    Literal, // aux field contains literal type (string, hex, image, ...)
};

struct VMImageSection {
    uint8_t type;
    uint8_t flags;
    uint16_t aux;
    uint32_t size; // in bytes, including this header
};

struct VMImageHeader {
    uint64_t magic0;
    uint64_t magic1;
    uint64_t hexHash;
    uint64_t programHash;

    uint32_t allocGlobals;
    uint32_t nonPointerGlobals;
};

struct VMImage {
    double *doubleLiterals;
    int *intLiterals;
    TValue *pointerLiterals;
    OpFun *opcodes;
};

// not doing this, likely
struct StackFrame {
    StackFrame *caller;
    uint32_t *retPC;
    TValue *stackBase;
    uint32_t *fnbase;
};

struct FiberContext {
    FiberContext *next;
    FiberContext *prev;

    uint16_t *imgbase;
    VMImage *img;
    uint16_t *pc;
    TValue *sp;
    TValue r0;
    TValue *caps;
};

} // namespace pxt

#undef PXT_MAIN
#define PXT_MAIN                                                                                   \
    int main(int argc, char **argv) {                                                              \
        pxt::initialArgv = argv;                                                                   \
        pxt::start();                                                                              \
        return 0;                                                                                  \
    }

#endif

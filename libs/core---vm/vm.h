#ifndef _PXT_VM_H
#define _PXT_VM_H

#include <pthread.h>
#include <setjmp.h>

#define VM_MAGIC0 0x000a34365458500aULL // \nPXT64\n\0
#define VM_MAGIC1 0x6837215e2bfe7154ULL

#define VM_OPCODE_BASE_SIZE 6 // up to 63 base opcodes
#define VM_OPCODE_PUSH_MASK (1 << VM_OPCODE_BASE_SIZE)
#define VM_OPCODE_ARG_POS (VM_OPCODE_BASE_SIZE + 1)
#define VM_OPCODE_BASE_MASK ((1 << VM_OPCODE_BASE_SIZE) - 1)
#define VM_FIRST_RTCALL (VM_OPCODE_BASE_MASK + 1)
#define VM_RTCALL_PUSH_MASK 0x2000

#define VM_FUNCTION_CODE_OFFSET (8 * 4)

// The binary has space for 4 64 bit pointers, so on 32 bit machines we pretend there is 8 of them
#ifdef PXT32
#define VM_NUM_CPP_METHODS 8
#else
#define VM_NUM_CPP_METHODS 4
#endif

// maximum size (in words) of stack in a single function
#define VM_MAX_FUNCTION_STACK 200
#define VM_STACK_SIZE 1000

#define VM_ENCODE_PC(pc) ((TValue)(((pc) << 9) | 2))
#define VM_DECODE_PC(pc) (((uintptr_t)(pc)) >> 9)
#define VM_IS_ENCODED_PC(v) ((((uintptr_t)(v)) & ((1 << 9) - 1)) == 2)
#define TAG_STACK_BOTTOM VM_ENCODE_PC(1)

#define PXTEXT extern
#ifdef __MINGW32__
#define DLLEXPORT PXTEXT "C"
#else
#define DLLEXPORT PXTEXT "C"
#endif

namespace pxt {

struct FiberContext;
typedef void (*OpFun)(FiberContext *ctx, unsigned arg);
typedef void (*ApiFun)(FiberContext *ctx);

// keep in sync with backvm.ts
enum class SectionType : uint8_t {
    Invalid = 0x00,

    // singular sections
    InfoHeader = 0x01,       // VMImageHeader
    OpCodeMap = 0x02,        // \0-terminated names of opcodes and APIs (shims)
    NumberLiterals = 0x03,   // array of boxed doubles and ints
    ConfigData = 0x04,       // sorted array of pairs of int32s; zero-terminated
    IfaceMemberNames = 0x05, // array of 32 bit offsets, that point to string literals
    NumberBoxes = 0x06,      // numbers from NumberLiteral that need to be boxed on 32 bit hosts

    // repetitive sections
    Function = 0x20,
    Literal = 0x21, // aux field contains literal type (string, hex, image, ...)
    VTable = 0x22,
};

struct VMImageSection {
    SectionType type;
    uint8_t flags;
    uint16_t aux;
    uint32_t size; // in bytes, including this header
    uint8_t data[0];
};

static inline TValue vmLiteralVal(VMImageSection *sect) {
#ifdef PXT64
    return (TValue)sect->data;
#else
    return (TValue)(sect->data + 4);
#endif
}

static inline VMImageSection *vmNextSection(VMImageSection *sect) {
    return (VMImageSection *)((uint8_t *)sect + sect->size);
}

struct VMPatchState;
VMPatchState *vm_alloc_patch_state();
void vm_finish_patch(VMPatchState *state);
const char *vm_patch_image(VMPatchState *state, uint8_t *data, uint32_t len);

STATIC_ASSERT(sizeof(VMImageSection) == 8);

#define PXT_WAIT_SOURCE_PROMISE 0x1fff0

struct OpcodeDesc {
    const char *name;
    OpFun fn;
    int numArgs;
};

struct IfaceEntry {
    uint16_t memberId;
    uint16_t aux;
    uint32_t method;
};

extern const OpcodeDesc staticOpcodes[];

struct VMImageHeader {
    uint64_t magic0;
    uint64_t magic1;
    uint64_t hexHash;
    uint64_t programHash;

    uint32_t allocGlobals;
    uint32_t nonPointerGlobals;

    uint64_t lastUsageTime;
    uint64_t installationTime;
    uint64_t publicationTime;
    uint32_t imageSize;
    uint8_t reserved[60];
    uint8_t name[128];
};

struct VMImage {
    TValue *numberLiterals;
    TValue *pointerLiterals;
    BoxedNumber *boxedNumbers;
    OpFun *opcodes;
    int32_t *configData;
    uintptr_t *ifaceMemberNames;

    uint64_t *dataStart, *dataEnd;
    VMImageSection **sections;
    VMImageHeader *infoHeader;
    const OpcodeDesc **opcodeDescs;
    RefAction *entryPoint;

    // every fiber's sp starts at stackTop and goes towards stackBase
    // stackTop > stackBase
    // stackLimit is close to stackBase
    TValue *stackBase;
    TValue *stackTop;
    TValue *stackLimit;

    uint32_t numSections;
    uint32_t numNumberLiterals;
    uint32_t numConfigDataEntries;
    uint32_t numOpcodes;
    uint32_t numIfaceMemberNames;
    uint32_t errorCode;
    uint32_t errorOffset;
    int toStringKey;

    int execLock;
};

typedef TValue (*fiber_resume_t)(void *);

struct FiberContext {
    FiberContext *next;

    uint16_t *imgbase;
    VMImage *img;
    uint16_t *pc;
    uint16_t *resumePC;
    uint16_t *foreverPC;
    TValue *sp;
    TValue r0;
    RefAction *currAction;

    TryFrame *tryFrame;
    TValue thrownValue;
    jmp_buf loopjmp;

    TValue *stackCopy;
    int stackCopySize;

    // wait_for_event
    int waitSource;
    int waitValue;

    // for sleep
    uint64_t wakeTime;

    fiber_resume_t wakeFn;
    void *wakeFnArg;
    HandlerBinding *handlerBinding;
};

#define PXT_EXN_CTX() currentFiber

void restoreVMExceptionState(TryFrame *tf, FiberContext *ctx);
#define pxt_restore_exception_state restoreVMExceptionState

FiberContext *suspendFiber(); // returns currentFiber
// this can be called from a different thread; fn(arg) will be called from user code thread
// just before the VM resumes execution; the result value will be stored in ctx->r0
void resumeFiberWithFn(FiberContext *ctx, fiber_resume_t fn, void *arg);
// a simpler version
void resumeFiber(FiberContext *ctx, TValue v);

extern VMImage *vmImg;
extern FiberContext *currentFiber;
extern volatile int panicCode;

static inline uint16_t *actionPC(RefAction *ra) {
    return (uint16_t *)((uint8_t *)vmImg->dataStart + (uint32_t)ra->func);
}

void vmStart();
VMImage *loadVMImage(void *data, unsigned length);
void unloadVMImage(VMImage *img);
VMImage *setVMImgError(VMImage *img, int code, void *pos);
void exec_loop(FiberContext *ctx);
void vmStartFromUser(const char *fn);
void target_yield();

#define DEF_CONVERSION(retp, tp, btp)                                                              \
    static inline retp tp(TValue v) {                                                              \
        if (!isPointer(v))                                                                         \
            failedCast(v);                                                                         \
        if (getVTable((RefObject *)v)->classNo != btp)                                             \
            failedCast(v);                                                                         \
        return (retp)v;                                                                            \
    }

DEF_CONVERSION(RefCollection *, asRefCollection, BuiltInType::RefCollection)
DEF_CONVERSION(RefAction *, asRefAction, BuiltInType::RefAction)
DEF_CONVERSION(RefRefLocal *, asRefRefLocal, BuiltInType::RefRefLocal)
DEF_CONVERSION(RefMap *, asRefMap, BuiltInType::RefMap)

DEF_CONVERSION(Buffer, asBuffer, BuiltInType::BoxedBuffer)
DEF_CONVERSION(Image_, asImage_, BuiltInType::RefImage)

String convertToString(FiberContext *ctx, TValue v);

} // namespace pxt

#endif
#ifndef _PXT_VM_H
#define _PXT_VM_H

#define OPCODE_BASE_SIZE 7 // up to 127 base opcodes
#define OPCODE_BASE_MASK ((1 << OPCODE_BASE_SIZE) - 1)

namespace pxt {

struct FiberContext;
typedef void (*OpFun)(FiberContext *ctx, unsigned arg);
typedef void (*ApiFun)(FiberContext *ctx);

enum class SectionType : uint8_t {
    Invalid = 0x00,

    // singular sections
    InfoHeader = 0x01,       // VMImageHeader
    OpCodeMap = 0x02,        // \0-terminated names of opcodes and APIs (shims)
    NumberLiterals = 0x03,   // array of boxed doubles and ints
    ConfigData = 0x04,       // sorted array of pairs of int32s; zero-terminated
    IfaceMemberNames = 0x05, // array of 32 bit offsets, that point to string literals

    // repetitive sections
    Function = 0x20,
    Literal = 0x21, // aux field contains literal type (string, hex, image, ...)
};

struct VMImageSection {
    SectionType type;
    uint8_t flags;
    uint16_t aux;
    uint32_t size; // in bytes, including this header
    uint8_t data[0];
};

#define VM_MAGIC0 0x000a34365458500aULL // \nPXT64\n\0
#define VM_MAGIC1 0x6837215e2bfe7154ULL

struct VMImageHeader {
    uint64_t magic0;
    uint64_t magic1;
    uint64_t hexHash;
    uint64_t programHash;

    uint32_t allocGlobals;
    uint32_t nonPointerGlobals;
};

struct VMImage {
    TValue *numberLiterals;
    TValue *pointerLiterals;
    uint32_t *configData;
    OpFun *opcodes;
    uint64_t *dataStart, *dataEnd;
    VMImageHeader *infoHeader;

    uint32_t numSections;
    uint32_t numNumberLiterals;
    uint32_t numConfigDataEntries;
    uint32_t errorCode;
    uint32_t errorOffset;
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

#endif
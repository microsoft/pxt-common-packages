#ifndef __PXTBASE_H
#define __PXTBASE_H

#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wformat"
#pragma GCC diagnostic ignored "-Warray-bounds"

// needed for gcc6; not sure why
#undef min
#undef max

#define NOLOG(...)                                                                                 \
    do {                                                                                           \
    } while (0)

#define MEMDBG NOLOG
//#define MEMDBG DMESG
#define MEMDBG2 NOLOG

#include "pxtconfig.h"
#include "configkeys.h"

#ifndef PXT_UTF8
#define PXT_UTF8 0
#endif

#if defined(PXT_VM)
#include <stdint.h>
#if UINTPTR_MAX == 0xffffffff
#define PXT32 1
#elif UINTPTR_MAX == 0xffffffffffffffff
#define PXT64 1
#else
#error "UINTPTR_MAX has invalid value"
#endif
#endif

#define intcheck(...) check(__VA_ARGS__)
//#define intcheck(...) do {} while (0)

#ifdef PXT_USE_FLOAT
#define NUMBER float
#else
#define NUMBER double
#endif

#include <string.h>
#include <stdint.h>
#include <math.h>

#ifdef POKY
void *operator new(size_t size, void *ptr);
void *operator new(size_t size);
#else
#include <new>
#endif

#include "platform.h"
#include "pxtcore.h"

#ifndef PXT_REGISTER_RESET
#define PXT_REGISTER_RESET(fn) ((void)0)
#endif

#define PXT_REFCNT_FLASH 0xfffe

#define CONCAT_1(a, b) a##b
#define CONCAT_0(a, b) CONCAT_1(a, b)
// already provided in some platforms, like mbedos
#ifndef STATIC_ASSERT
#define STATIC_ASSERT(e) enum { CONCAT_0(_static_assert_, __LINE__) = 1 / ((e) ? 1 : 0) };
#endif

#ifndef ramint_t
// this type limits size of arrays
#if defined(__linux__) || defined(PXT_VM)
// TODO fix the inline array accesses to take note of this!
#define ramint_t uint32_t
#else
#define ramint_t uint16_t
#endif
#endif

#ifndef PXT_IN_ISR
#define PXT_IN_ISR() (SCB->ICSR & SCB_ICSR_VECTACTIVE_Msk)
#endif

#ifdef POKY
inline void *operator new(size_t, void *p) {
    return p;
}
inline void *operator new[](size_t, void *p) {
    return p;
}
#endif

namespace pxt {

template <typename T> inline const T &max(const T &a, const T &b) {
    if (a < b)
        return b;
    return a;
}

template <typename T> inline const T &min(const T &a, const T &b) {
    if (a < b)
        return a;
    return b;
}

template <typename T> inline void swap(T &a, T &b) {
    T tmp = a;
    a = b;
    b = tmp;
}

//
// Tagged values (assume 4 bytes for now, Cortex-M0)
//
struct TValueStruct {};
typedef TValueStruct *TValue;

typedef TValue TNumber;
typedef TValue Action;
typedef TValue ImageLiteral;

// To be implemented by the target
extern "C" void target_panic(int error_code);
extern "C" void target_reset();
void sleep_ms(unsigned ms);
void sleep_us(uint64_t us);
void releaseFiber();
uint64_t current_time_us();
int current_time_ms();
void initRuntime();
void initSystemTimer();
void sendSerial(const char *data, int len);
void setSendToUART(void (*f)(const char *, int));
uint64_t getLongSerialNumber();
void registerWithDal(int id, int event, Action a, int flags = 16); // EVENT_LISTENER_DEFAULT_FLAGS
void runInParallel(Action a);
void runForever(Action a);
void waitForEvent(int id, int event);
//%
unsigned afterProgramPage();
//%
void dumpDmesg();
uint32_t hash_fnv1(const void *data, unsigned len);

// also defined DMESG macro
// end

#define TAGGED_SPECIAL(n) (TValue)(void *)((n << 2) | 2)
#define TAG_FALSE TAGGED_SPECIAL(2) // 10
#define TAG_TRUE TAGGED_SPECIAL(16) // 66
#define TAG_UNDEFINED (TValue)0
#define TAG_NULL TAGGED_SPECIAL(1) // 6
#define TAG_NAN TAGGED_SPECIAL(3)  // 14
#define TAG_NUMBER(n) (TNumber)(void *)(((uintptr_t)(uint32_t)(n) << 1) | 1)
#define TAG_NON_VALUE TAGGED_SPECIAL(4) // 18; doesn't represent any JS value

#ifdef PXT_VM
inline bool isEncodedDouble(uint64_t v) {
    return (v >> 48) != 0;
}
#endif

inline bool isDouble(TValue v) {
#ifdef PXT64
    return ((uintptr_t)v >> 48) != 0;
#else
    (void)v;
    return false;
#endif
}

inline bool isPointer(TValue v) {
    return !isDouble(v) && v != 0 && ((intptr_t)v & 3) == 0;
}

inline bool isTagged(TValue v) {
    return (!isDouble(v) && ((intptr_t)v & 3)) || !v;
}

inline bool isInt(TValue v) {
    return !isDouble(v) && ((intptr_t)v & 1);
}

inline bool isSpecial(TValue v) {
    return !isDouble(v) && ((intptr_t)v & 2);
}

inline bool bothNumbers(TValue a, TValue b) {
    return !isDouble(a) && !isDouble(b) && ((intptr_t)a & (intptr_t)b & 1);
}

inline int numValue(TValue n) {
    return (int)((intptr_t)n >> 1);
}

inline bool canBeTagged(int v) {
    (void)v;
#ifdef PXT_BOX_DEBUG
    return false;
#elif defined(PXT64)
    return true;
#else
    return (v << 1) >> 1 == v;
#endif
}

// see https://anniecherkaev.com/the-secret-life-of-nan

#define NanBoxingOffset 0x1000000000000LL

template <typename TO, typename FROM> TO bitwise_cast(FROM in) {
    STATIC_ASSERT(sizeof(TO) == sizeof(FROM));
    union {
        FROM from;
        TO to;
    } u;
    u.from = in;
    return u.to;
}

inline double decodeDouble(uint64_t v) {
    return bitwise_cast<double>(v - NanBoxingOffset);
}

#ifdef PXT64
STATIC_ASSERT(sizeof(void *) == 8);
inline double doubleVal(TValue v) {
    return bitwise_cast<double>((uint64_t)v - NanBoxingOffset);
}

inline TValue tvalueFromDouble(double d) {
    return (TValue)(bitwise_cast<uint64_t>(d) + NanBoxingOffset);
}
#else
STATIC_ASSERT(sizeof(void *) == 4);
#endif

// keep in sym with sim/control.ts
typedef enum {
    PANIC_CODAL_OOM = 20,
    PANIC_GC_OOM = 21,
    PANIC_GC_TOO_BIG_ALLOCATION = 22,
    PANIC_CODAL_HEAP_ERROR = 30,
    PANIC_CODAL_NULL_DEREFERENCE = 40,
    PANIC_CODAL_USB_ERROR = 50,
    PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR = 90,

    PANIC_INVALID_BINARY_HEADER = 901,
    PANIC_OUT_OF_BOUNDS = 902,
    PANIC_REF_DELETED = 903,
    PANIC_SIZE = 904,
    PANIC_INVALID_VTABLE = 905,
    PANIC_INTERNAL_ERROR = 906,
    PANIC_NO_SUCH_CONFIG = 907,
    PANIC_NO_SUCH_PIN = 908,
    PANIC_INVALID_ARGUMENT = 909,
    PANIC_MEMORY_LIMIT_EXCEEDED = 910,
    PANIC_SCREEN_ERROR = 911,
    PANIC_MISSING_PROPERTY = 912,
    PANIC_INVALID_IMAGE = 913,
    PANIC_CALLED_FROM_ISR = 914,
    PANIC_HEAP_DUMPED = 915,
    PANIC_STACK_OVERFLOW = 916,
    PANIC_BLOCKING_TO_STRING = 917,
    PANIC_VM_ERROR = 918,
    PANIC_SETTINGS_CLEARED = 920,
    PANIC_SETTINGS_OVERLOAD = 921,
    PANIC_SETTINGS_SECRET_MISSING = 922,
    PANIC_DELETE_ON_CLASS = 923,
    PANIC_OUT_OF_TIMERS = 924,
    PANIC_JACDAC = 925,
    PANIC_MICROPHONE_MISSING = 926,
    PANIC_VARIANT_NOT_SUPPORTED = 927,

    PANIC_CAST_FIRST = 980,
    PANIC_CAST_FROM_UNDEFINED = 980,
    PANIC_CAST_FROM_BOOLEAN = 981,
    PANIC_CAST_FROM_NUMBER = 982,
    PANIC_CAST_FROM_STRING = 983,
    PANIC_CAST_FROM_OBJECT = 984,
    PANIC_CAST_FROM_FUNCTION = 985,
    PANIC_CAST_FROM_NULL = 989,

    PANIC_UNHANDLED_EXCEPTION = 999,

} PXT_PANIC;

extern const uintptr_t functionsAndBytecode[];
extern TValue *globals;
extern uint16_t *bytecode;
class RefRecord;

// Utility functions

typedef TValue (*RunActionType)(Action a, TValue arg0, TValue arg1, TValue arg2);

#define asmRunAction3 ((RunActionType)(((uintptr_t *)bytecode)[12]))

static inline TValue runAction3(Action a, TValue arg0, TValue arg1, TValue arg2) {
    return asmRunAction3(a, arg0, arg1, 0);
}
static inline TValue runAction2(Action a, TValue arg0, TValue arg1) {
    return asmRunAction3(a, arg0, arg1, 0);
}
static inline TValue runAction1(Action a, TValue arg0) {
    return asmRunAction3(a, arg0, 0, 0);
}
static inline TValue runAction0(Action a) {
    return asmRunAction3(a, 0, 0, 0);
}

class RefAction;
class BoxedString;
struct VTable;

//%
Action mkAction(int totallen, RefAction *act);
//% expose
int templateHash();
//% expose
int programHash();
//% expose
BoxedString *programName();
//% expose
unsigned programSize();
//%
int getNumGlobals();
//%
RefRecord *mkClassInstance(VTable *vt);
//%
void debugMemLeaks();
//%
void anyPrint(TValue v);

//%
int getConfig(int key, int defl = -1);

//%
int toInt(TNumber v);
//%
unsigned toUInt(TNumber v);
//%
NUMBER toDouble(TNumber v);
//%
float toFloat(TNumber v);
//%
TNumber fromDouble(NUMBER r);
//%
TNumber fromFloat(float r);

//%
TNumber fromInt(int v);
//%
TNumber fromUInt(unsigned v);
//%
TValue fromBool(bool v);
//%
bool eq_bool(TValue a, TValue b);
//%
bool eqq_bool(TValue a, TValue b);

//%
void failedCast(TValue v, void *addr = NULL);
//%
void missingProperty(TValue v);

void error(PXT_PANIC code, int subcode = 0);
void exec_binary(unsigned *pc);
void start();

struct HandlerBinding {
    HandlerBinding *next;
    int source;
    int value;
    Action action;
#ifndef PXT_CODAL
    uint32_t flags;
    struct Event *pending;
#endif
};
HandlerBinding *findBinding(int source, int value);
HandlerBinding *nextBinding(HandlerBinding *curr, int source, int value);
void setBinding(int source, int value, Action act);

// Legacy stuff; should no longer be used
//%
TValue incr(TValue e);
//%
void decr(TValue e);

inline TValue incr(TValue e) {
    return e;
}
inline void decr(TValue e) {}

class RefObject;

static inline RefObject *incrRC(RefObject *r) {
    return r;
}
static inline void decrRC(RefObject *) {}

inline void *ptrOfLiteral(int offset) {
    return &bytecode[offset];
}

// Checks if object is ref-counted, and has a custom PXT vtable in front
// TODO
inline bool isRefCounted(TValue e) {
    return isPointer(e);
}

inline void check(int cond, PXT_PANIC code, int subcode = 0) {
    if (!cond)
        error(code, subcode);
}

inline void oops(int subcode = 0) {
    target_panic(800 + subcode);
}

class RefObject;

typedef void (*RefObjectMethod)(RefObject *self);
typedef unsigned (*RefObjectSizeMethod)(RefObject *self);
typedef void *PVoid;
typedef void **PPVoid;

typedef void *Object_;

#define VTABLE_MAGIC 0xF9
#define VTABLE_MAGIC2 0xF8

enum class ValType : uint8_t {
    Undefined,
    Boolean,
    Number,
    String,
    Object,
    Function,
};

// keep in sync with pxt-core (search for the type name)
enum class BuiltInType : uint16_t {
    BoxedString = 1,
    BoxedNumber = 2,
    BoxedBuffer = 3,
    RefAction = 4,
    RefImage = 5,
    RefCollection = 6,
    RefRefLocal = 7,
    RefMap = 8,
    RefMImage = 9,             // microbit-specific
    MMap = 10,                 // linux, mostly ev3
    BoxedString_SkipList = 11, // used by VM bytecode representation only
    BoxedString_ASCII = 12,    // ditto
    ZPin = 13,
    User0 = 16,
};

struct VTable {
    uint16_t numbytes;
    ValType objectType;
    uint8_t magic;
#ifdef PXT_VM
    uint16_t ifaceHashEntries;
    BuiltInType lastClassNo;
#else
    PVoid *ifaceTable;
#endif
    BuiltInType classNo;
    uint16_t reserved;
    uint32_t ifaceHashMult;

    // we only use the first few methods here; pxt will generate more
    PVoid methods[8];
};

//%
extern const VTable string_inline_ascii_vt;
#if PXT_UTF8
//%
extern const VTable string_inline_utf8_vt;
//%
extern const VTable string_cons_vt;
//%
extern const VTable string_skiplist16_vt;
//%
extern const VTable string_skiplist16_packed_vt;
#endif
//%
extern const VTable buffer_vt;
//%
extern const VTable number_vt;
//%
extern const VTable RefAction_vtable;

#ifndef PXT_IS_READONLY
// assume ARM - ram addresses are 0x2000_0000+; flash is either 0x0+ or 0x0800_0000+
#define PXT_IS_READONLY(v) (isTagged(v) || !((uintptr_t)v >> 28))
#endif

inline bool isReadOnly(TValue v) {
    return PXT_IS_READONLY(v);
}

// A base abstract class for ref-counted objects.
class RefObject {
  public:
    const VTable *vtable;

    RefObject(const VTable *vt) {
#if defined(PXT32) && defined(PXT_VM) && !defined(PXT_ESP32)
        if ((uint32_t)vt & 0xf0000000)
            target_panic(PANIC_INVALID_VTABLE);
#endif
        vtable = vt;
    }

    void destroyVT();
    void printVT();

    inline uintptr_t vt() { return (uintptr_t)vtable; }
    inline void setVT(uintptr_t v) { vtable = (const VTable *)v; }

    inline void ref() {}
    inline void unref() {}
    inline bool isReadOnly() { return pxt::isReadOnly((TValue)this); }
};

class Segment {
  private:
    TValue *data;
    ramint_t length;
    ramint_t size;

    // this just gives max value of ramint_t
    void growByMin(ramint_t minSize);
    void ensure(ramint_t newSize);

  public:
    static constexpr ramint_t MaxSize = (((1U << (8 * sizeof(ramint_t) - 1)) - 1) << 1) + 1;
    static constexpr TValue DefaultValue = TAG_UNDEFINED; // == NULL

    Segment() : data(nullptr), length(0), size(0) {}

    TValue get(unsigned i) { return i < length ? data[i] : NULL; }
    void set(unsigned i, TValue value);

    unsigned getLength() { return length; };
    void setLength(unsigned newLength);

    void push(TValue value) { set(length, value); }
    TValue pop();

    TValue remove(unsigned i);
    void insert(unsigned i, TValue value);

    void destroy();

    void print();

    TValue *getData() { return data; }
};

// Low-Level segment using system malloc
class LLSegment {
  private:
    TValue *data;
    ramint_t length;
    ramint_t size;

  public:
    LLSegment() : data(nullptr), length(0), size(0) {}

    void set(unsigned idx, TValue v);
    void push(TValue value) { set(length, value); }
    TValue pop();
    void destroy();
    void setLength(unsigned newLen);

    TValue get(unsigned i) { return i < length ? data[i] : NULL; }
    unsigned getLength() { return length; };
    TValue *getData() { return data; }
};

// A ref-counted collection of either primitive or ref-counted objects (String, Image,
// user-defined record, another collection)
class RefCollection : public RefObject {
  public:
    Segment head;

    RefCollection();

    static void destroy(RefCollection *coll);
    static void scan(RefCollection *coll);
    static unsigned gcsize(RefCollection *coll);
    static void print(RefCollection *coll);

    unsigned length() { return head.getLength(); }
    void setLength(unsigned newLength) { head.setLength(newLength); }
    TValue getAt(int i) { return head.get(i); }
    TValue *getData() { return head.getData(); }
};

class RefMap : public RefObject {
  public:
    Segment keys;
    Segment values;

    RefMap();
    static void destroy(RefMap *map);
    static void scan(RefMap *map);
    static unsigned gcsize(RefMap *coll);
    static void print(RefMap *map);
    int findIdx(BoxedString *key);
};

// A ref-counted, user-defined JS object.
class RefRecord : public RefObject {
  public:
    // The object is allocated, so that there is space at the end for the fields.
    TValue fields[];

    RefRecord(VTable *v) : RefObject(v) {}

    TValue ld(int idx);
    TValue ldref(int idx);
    void st(int idx, TValue v);
    void stref(int idx, TValue v);
};

static inline VTable *getVTable(RefObject *r) {
    return (VTable *)(r->vt() & ~1);
}

static inline VTable *getAnyVTable(TValue v) {
    if (!isRefCounted(v))
        return NULL;
    auto vt = getVTable((RefObject *)v);
    if (vt->magic == VTABLE_MAGIC)
        return vt;
    return NULL;
}

// these are needed when constructing vtables for user-defined classes
//%
void RefRecord_destroy(RefRecord *r);
//%
void RefRecord_print(RefRecord *r);
//%
void RefRecord_scan(RefRecord *r);
//%
unsigned RefRecord_gcsize(RefRecord *r);

typedef TValue (*ActionCB)(TValue *captured, TValue arg0, TValue arg1, TValue arg2);

// Ref-counted function pointer.
class RefAction : public RefObject {
  public:
    uint16_t len;
    uint16_t numArgs;
#ifdef PXT_VM
    uint16_t initialLen;
    uint16_t flags;
    uintptr_t func;
#else
    ActionCB func; // The function pointer
#endif
    // fields[] contain captured locals
    TValue fields[];

    static void destroy(RefAction *act);
    static void scan(RefAction *act);
    static unsigned gcsize(RefAction *coll);
    static void print(RefAction *act);

    RefAction();

    inline void stCore(int idx, TValue v) {
        // DMESG("ST [%d] = %d ", idx, v); this->print();
        intcheck(0 <= idx && idx < len, PANIC_OUT_OF_BOUNDS, 10);
        intcheck(fields[idx] == 0, PANIC_OUT_OF_BOUNDS, 11); // only one assignment permitted
        fields[idx] = v;
    }
};

// These two are used to represent locals written from inside inline functions
class RefRefLocal : public RefObject {
  public:
    TValue v;
    static void destroy(RefRefLocal *l);
    static void scan(RefRefLocal *l);
    static unsigned gcsize(RefRefLocal *l);
    static void print(RefRefLocal *l);
    RefRefLocal();
};

typedef int color;

// note: this is hardcoded in PXT (hexfile.ts)

class BoxedNumber : public RefObject {
  public:
    NUMBER num;
    BoxedNumber() : RefObject(&number_vt) {}
} __attribute__((packed));

class BoxedString : public RefObject {
  public:
    union {
        struct {
            uint16_t length; // ==size
            char data[0];
        } ascii;
#if PXT_UTF8
        struct {
            uint16_t size;
            char data[0];
        } utf8;
        struct {
            BoxedString *left;
            BoxedString *right;
        } cons;
        struct {
            uint16_t size;   // in bytes
            uint16_t length; // in characters
            uint16_t *list;
        } skip;
        struct {
            uint16_t size;   // in bytes
            uint16_t length; // in characters
            uint16_t list[0];
        } skip_pack;
#endif
    };

#if PXT_UTF8
    uintptr_t runMethod(int idx) {
        return ((uintptr_t(*)(BoxedString *))vtable->methods[idx])(this);
    }
    const char *getUTF8Data() { return (const char *)runMethod(4); }
    uint32_t getUTF8Size() { return (uint32_t)runMethod(5); }
    // in characters
    uint32_t getLength() { return (uint32_t)runMethod(6); }
    const char *getUTF8DataAt(uint32_t pos) {
        auto meth = ((const char *(*)(BoxedString *, uint32_t))vtable->methods[7]);
        return meth(this, pos);
    }
#else
    const char *getUTF8Data() { return ascii.data; }
    uint32_t getUTF8Size() { return ascii.length; }
    uint32_t getLength() { return ascii.length; }
    const char *getUTF8DataAt(uint32_t pos) { return pos < ascii.length ? ascii.data + pos : NULL; }
#endif

    TNumber charCodeAt(int pos);

    BoxedString(const VTable *vt) : RefObject(vt) {}
};

// cross version compatible way of accessing string data
#ifndef PXT_STRING_DATA
#define PXT_STRING_DATA(str) str->getUTF8Data()
#endif

// cross version compatible way of accessing string length
#ifndef PXT_STRING_DATA_LENGTH
#define PXT_STRING_DATA_LENGTH(str) str->getUTF8Size()
#endif

class BoxedBuffer : public RefObject {
  public:
    // data needs to be word-aligned, so we use 32 bits for length
    int length;
    uint8_t data[0];
    BoxedBuffer() : RefObject(&buffer_vt) {}

    static bool isInstance(TValue v);
};

// cross version compatible way of access data field
#ifndef PXT_BUFFER_DATA
#define PXT_BUFFER_DATA(buffer) buffer->data
#endif

// cross version compatible way of access data length
#ifndef PXT_BUFFER_LENGTH
#define PXT_BUFFER_LENGTH(buffer) buffer->length
#endif

#ifndef PXT_CREATE_BUFFER
#define PXT_CREATE_BUFFER(data, len) pxt::mkBuffer(data, len)
#endif

// Legacy format:
// the first byte of data indicates the format - currently 0xE1 or 0xE4 to 1 or 4 bit bitmaps
// second byte indicates width in pixels
// third byte indicates the height (which should also match the size of the buffer)
// just like ordinary buffers, these can be layed out in flash

// Current format:
// 87 BB WW WW HH HH 00 00 DATA
// that is: 0x87, 0x01 or 0x04 - bpp, width in little endian, height, 0x00, 0x00 followed by data
// for 4 bpp images, rows are word-aligned (as in legacy)

#define IMAGE_HEADER_MAGIC 0x87

struct ImageHeader {
    uint8_t magic;
    uint8_t bpp;
    uint16_t width;
    uint16_t height;
    uint16_t padding;
    uint8_t pixels[0];
};

class RefImage : public RefObject {
  public:
    BoxedBuffer *buffer;
    uint32_t revision;

    RefImage(BoxedBuffer *buf);
    RefImage(uint32_t sz);

    void setBuffer(BoxedBuffer *b);

    uint8_t *data() { return buffer->data; }
    int length() { return (int)buffer->length; }

    ImageHeader *header() { return (ImageHeader *)buffer->data; }
    int pixLength() { return length() - sizeof(ImageHeader); }

    int width() { return header()->width; }
    int height() { return header()->height; }
    int wordHeight();
    int bpp() { return header()->bpp; }

    bool hasPadding() { return (height() & 0x7) != 0; }

    uint8_t *pix() { return header()->pixels; }

    int byteHeight() {
        if (bpp() == 1)
            return (height() + 7) >> 3;
        else if (bpp() == 4)
            return ((height() * 4 + 31) >> 5) << 2;
        else {
            oops(21);
            return -1;
        }
    }

    uint8_t *pix(int x, int y) {
        uint8_t *d = &pix()[byteHeight() * x];
        if (y) {
            if (bpp() == 1)
                d += y >> 3;
            else if (bpp() == 4)
                d += y >> 1;
        }
        return d;
    }

    uint8_t fillMask(color c);
    bool inRange(int x, int y);
    void clamp(int *x, int *y);
    void makeWritable();

    static void destroy(RefImage *t);
    static void scan(RefImage *t);
    static unsigned gcsize(RefImage *t);
    static void print(RefImage *t);
};

RefImage *mkImage(int w, int h, int bpp);

typedef BoxedBuffer *Buffer;
typedef BoxedString *String;
typedef RefImage *Image_;

uint32_t toRealUTF8(String str, uint8_t *dst);

// keep in sync with github/pxt/pxtsim/libgeneric.ts
enum class NumberFormat {
    Int8LE = 1,
    UInt8LE,
    Int16LE,
    UInt16LE,
    Int32LE,
    Int8BE,
    UInt8BE,
    Int16BE,
    UInt16BE,
    Int32BE,

    UInt32LE,
    UInt32BE,
    Float32LE,
    Float64LE,
    Float32BE,
    Float64BE,
};

// this will, unlike mkStringCore, UTF8-canonicalize the data
String mkString(const char *data, int len = -1);
// data can be NULL in both cases
Buffer mkBuffer(const void *data, int len);
String mkStringCore(const char *data, int len = -1);

TNumber getNumberCore(uint8_t *buf, int size, NumberFormat format);
void setNumberCore(uint8_t *buf, int size, NumberFormat format, TNumber value);

void seedRandom(unsigned seed);
void seedAddRandom(unsigned seed);
// max is inclusive
unsigned getRandom(unsigned max);

ValType valType(TValue v);

// this is equivalent to JS `throw v`; it will leave
// the current function(s), all the way until the nearest try block and
// ignore all destructors (think longjmp())
void throwValue(TValue v);

void registerGC(TValue *root, int numwords = 1);
void unregisterGC(TValue *root, int numwords = 1);
void registerGCPtr(TValue ptr);
void unregisterGCPtr(TValue ptr);
static inline void registerGCObj(RefObject *ptr) {
    registerGCPtr((TValue)ptr);
}
static inline void unregisterGCObj(RefObject *ptr) {
    unregisterGCPtr((TValue)ptr);
}
void gc(int flags);

struct StackSegment {
    void *top;
    void *bottom;
    StackSegment *next;
};

#define NUM_TRY_FRAME_REGS 3
struct TryFrame {
    TryFrame *parent;
    uintptr_t registers[NUM_TRY_FRAME_REGS];
};

struct ThreadContext {
    TValue *globals;
    StackSegment stack;
    TryFrame *tryFrame;
    TValue thrownValue;
#ifdef PXT_GC_THREAD_LIST
    ThreadContext *next;
    ThreadContext *prev;
#endif
};

#ifdef PXT_GC_THREAD_LIST
extern ThreadContext *threadContexts;
void *threadAddressFor(ThreadContext *, void *sp);
#endif

void releaseThreadContext(ThreadContext *ctx);
ThreadContext *getThreadContext();
void setThreadContext(ThreadContext *ctx);

#ifndef PXT_GC_THREAD_LIST
void gcProcessStacks(int flags);
#endif

void gcProcess(TValue v);
void gcFreeze();

#ifdef PXT_VM
void gcStartup();
void gcPreStartup();
#endif

void coreReset();
void gcReset();
void systemReset();

void doNothing();

void *gcAllocate(int numbytes);
void *gcAllocateArray(int numbytes);
extern "C" void *app_alloc(int numbytes);
extern "C" void *app_free(void *ptr);
extern "C" void *app_alloc_at(void *at, int numbytes);
void gcPreAllocateBlock(uint32_t sz);

int redirectSamples(int16_t *dst, int numsamples, int samplerate);

#ifdef PXT64
#define TOWORDS(bytes) (((bytes) + 7) >> 3)
#else
#define TOWORDS(bytes) (((bytes) + 3) >> 2)
#endif

#ifndef PXT_VM
#define soft_panic target_panic
#endif

extern int debugFlags;

enum class PerfCounters {
    GC,
};

#ifdef PXT_PROFILE
#ifndef PERF_NOW
#error "missing platform timer support"
#endif

#ifndef PERF_NOW_MASK
#define PERF_NOW_MASK 0xffffffff
#endif

#ifndef PERF_NOW_SCALE
#define PERF_NOW_SCALE 1
#endif

struct PerfCounter {
    uint32_t value;
    uint32_t numstops;
    uint32_t start;
};

extern struct PerfCounter *perfCounters;

void initPerfCounters();
//%
void dumpPerfCounters();
//%
void startPerfCounter(PerfCounters n);
//%
void stopPerfCounter(PerfCounters n);
#else
inline void startPerfCounter(PerfCounters n) {}
inline void stopPerfCounter(PerfCounters n) {}
inline void initPerfCounters() {}
inline void dumpPerfCounters() {}
#endif

// Handling of built-in string literals (like "[Object]", "true" etc.).

// This has the same layout as BoxedString, but has statically allocated buffer
template <size_t N> struct BoxedStringLayout {
    const void *vtable;
    uint16_t size;
    const char data[N];
};

template <size_t N> constexpr size_t _boxedStringLen(char const (&)[N]) {
    return N;
}

// strings defined here as used as (String)name
#define PXT_DEF_STRING(name, val)                                                                  \
    const BoxedStringLayout<_boxedStringLen(val)> name[1] = {                                      \
        {&pxt::string_inline_ascii_vt, _boxedStringLen(val) - 1, val}};

// bigger value - less memory, but slower
// 16/20 keeps s.length and s.charCodeAt(i) at about 200 cycles (for actual unicode strings),
// which is similar to amortized allocation time
#define PXT_STRING_SKIP_INCR 16 // needs to be power of 2; needs to be kept in sync with compiler
#define PXT_STRING_MIN_SKIP                                                                        \
    20 // min. size of string to use skip list; static code has its own limit

#define PXT_NUM_SKIP_ENTRIES(p) ((p)->skip.length / PXT_STRING_SKIP_INCR)
#define PXT_SKIP_DATA_IND(p) ((const char *)(p->skip.list + PXT_NUM_SKIP_ENTRIES(p)))
#define PXT_SKIP_DATA_PACK(p) ((const char *)(p->skip_pack.list + PXT_NUM_SKIP_ENTRIES(p)))

} // namespace pxt

using namespace pxt;

namespace numops {
//%
String toString(TValue v);
//%
int toBool(TValue v);
//%
int toBoolDecr(TValue v);
} // namespace numops

namespace pxt {
inline bool toBoolQuick(TValue v) {
    if (v == TAG_TRUE)
        return true;
    if (v == TAG_FALSE || v == TAG_UNDEFINED || v == TAG_NULL)
        return false;
    return numops::toBool(v);
}
} // namespace pxt

namespace pxtrt {
//%
RefMap *mkMap();
//%
TValue mapGetByString(RefMap *map, String key);
//%
int lookupMapKey(String key);
//%
TValue mapGet(RefMap *map, unsigned key);
//% expose
void mapSetByString(RefMap *map, String key, TValue val);
//%
void mapSet(RefMap *map, unsigned key, TValue val);
} // namespace pxtrt

namespace pins {
Buffer createBuffer(int size);
}

namespace String_ {
//%
int compare(String a, String b);
} // namespace String_

namespace Array_ {
//%
RefCollection *mk();
//%
int length(RefCollection *c);
//%
void setLength(RefCollection *c, int newLength);
//%
void push(RefCollection *c, TValue x);
//%
TValue pop(RefCollection *c);
//%
TValue getAt(RefCollection *c, int x);
//%
void setAt(RefCollection *c, int x, TValue y);
//%
TValue removeAt(RefCollection *c, int x);
//%
void insertAt(RefCollection *c, int x, TValue value);
//%
int indexOf(RefCollection *c, TValue x, int start);
//%
bool removeElement(RefCollection *c, TValue x);
} // namespace Array_

#define NEW_GC(T, ...) new (gcAllocate(sizeof(T))) T(__VA_ARGS__)

// The ARM Thumb generator in the JavaScript code is parsing
// the hex file and looks for the magic numbers as present here.
//
// Then it fetches function pointer addresses from there.
//
// The vtable pointers are there, so that the ::emptyData for various types
// can be patched with the right vtable.
//

#ifndef MICROBIT_CODAL
#define FLASH_TOP 0x00000000
#else
#if MICROBIT_CODAL
#if MICROBIT_TOP_OF_FLASH
#define FLASH_TOP MICROBIT_TOP_OF_FLASH
#else
#define FLASH_TOP 0x00073000
#endif
#else
#define FLASH_TOP 0x00000000
#endif         
#endif

#define PXT_SHIMS_BEGIN                                                                            \
    namespace pxt {                                                                                \
    const uintptr_t functionsAndBytecode[]                                                         \
        __attribute__((aligned(0x20))) = {0x08010801, 0x42424242, 0x08010801, 0x8de9d83e, FLASH_TOP,

#define PXT_SHIMS_END                                                                              \
    }                                                                                              \
    ;                                                                                              \
    }

#if !defined(X86_64) && !defined(PXT_VM)
#pragma GCC diagnostic ignored "-Wpmf-conversions"
#endif

#ifdef PXT_VM
#define DEF_VTABLE(name, tp, valtype, ...)                                                         \
    const VTable name = {sizeof(tp), valtype, VTABLE_MAGIC, 0, BuiltInType::tp, BuiltInType::tp,   \
                         0,          0,       {__VA_ARGS__}};
#define DEF_VTABLE_EXT(name, tp, valtype, ...)                                                     \
    const VTable name = {sizeof(tp), valtype, VTABLE_MAGIC2, 0, BuiltInType::tp, BuiltInType::tp,  \
                         0,          0,       {__VA_ARGS__}};
#else
#define DEF_VTABLE(name, tp, valtype, ...)                                                         \
    const VTable name = {sizeof(tp), valtype, VTABLE_MAGIC, 0, BuiltInType::tp,                    \
                         0,          0,       {__VA_ARGS__}};
#define DEF_VTABLE_EXT(name, tp, valtype, ...)                                                     \
    const VTable name = {sizeof(tp), valtype, VTABLE_MAGIC2, 0, BuiltInType::tp,                   \
                         0,          0,       {__VA_ARGS__}};
#endif

#define PXT_VTABLE(classname, valtp)                                                               \
    DEF_VTABLE(classname##_vtable, classname, valtp, (void *)&classname::destroy,                  \
               (void *)&classname::print, (void *)&classname::scan, (void *)&classname::gcsize)

#define PXT_EXT_VTABLE(classname)                                                                  \
    static int classname##_gcsize() { return sizeof(classname); }                                  \
    DEF_VTABLE_EXT(classname##_vtable, classname, ValType::Object, (void *)&pxt::doNothing,        \
                   (void *)&pxt::anyPrint, (void *)&pxt::doNothing, (void *)&classname##_gcsize)

#define PXT_VTABLE_INIT(classname) RefObject(&classname##_vtable)

#define PXT_VTABLE_CTOR(classname)                                                                 \
    PXT_VTABLE(classname, ValType::Object)                                                         \
    classname::classname() : PXT_VTABLE_INIT(classname)

#define PXT_MAIN                                                                                   \
    int main() {                                                                                   \
        pxt::start();                                                                              \
        return 0;                                                                                  \
    }

#define PXT_FNPTR(x) (uintptr_t)(void *)(x)

#define PXT_ABI(...)

#define JOIN(a, b) a##b
/// Defines getClassName() function to fetch the singleton
#define SINGLETON(ClassName)                                                                       \
    static ClassName *JOIN(inst, ClassName);                                                       \
    ClassName *JOIN(get, ClassName)() {                                                            \
        if (!JOIN(inst, ClassName))                                                                \
            JOIN(inst, ClassName) = new ClassName();                                               \
        return JOIN(inst, ClassName);                                                              \
    }

/// Defines getClassName() function to fetch the singleton if PIN present
#define SINGLETON_IF_PIN(ClassName, pin)                                                           \
    static ClassName *JOIN(inst, ClassName);                                                       \
    ClassName *JOIN(get, ClassName)() {                                                            \
        if (!JOIN(inst, ClassName) && LOOKUP_PIN(pin))                                             \
            JOIN(inst, ClassName) = new ClassName();                                               \
        return JOIN(inst, ClassName);                                                              \
    }

#ifdef PXT_VM
#include "vm.h"
#endif

#endif

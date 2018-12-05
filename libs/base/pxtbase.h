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

#ifndef PXT_VTABLE_SHIFT
#define PXT_VTABLE_SHIFT 2
#endif

#define PXT_REFCNT_FLASH 0xfffe

#define CONCAT_1(a, b) a##b
#define CONCAT_0(a, b) CONCAT_1(a, b)
#define STATIC_ASSERT(e) enum { CONCAT_0(_static_assert_, __LINE__) = 1 / ((e) ? 1 : 0) };

#ifndef ramint_t
// this type limits size of arrays
#ifdef __linux__
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
void sendSerial(const char *data, int len);
void setSendToUART(void (*f)(const char *, int));
int getSerialNumber();
void registerWithDal(int id, int event, Action a, int flags = 16); // EVENT_LISTENER_DEFAULT_FLAGS
void runInParallel(Action a);
void runForever(Action a);
void waitForEvent(int id, int event);
//%
unsigned afterProgramPage();
//%
void dumpDmesg();

// also defined DMESG macro
// end

#define TAGGED_SPECIAL(n) (TValue)(void *)((n << 2) | 2)
#define TAG_FALSE TAGGED_SPECIAL(2) // 10
#define TAG_TRUE TAGGED_SPECIAL(16) // 66
#define TAG_UNDEFINED (TValue)0
#define TAG_NULL TAGGED_SPECIAL(1) // 6
#define TAG_NAN TAGGED_SPECIAL(3)  // 14
#define TAG_NUMBER(n) (TNumber)(void *)((n << 1) | 1)

inline bool isTagged(TValue v) {
    return ((intptr_t)v & 3) || !v;
}

inline bool isNumber(TValue v) {
    return (intptr_t)v & 1;
}

inline bool isSpecial(TValue v) {
    return (intptr_t)v & 2;
}

inline bool bothNumbers(TValue a, TValue b) {
    return (intptr_t)a & (intptr_t)b & 1;
}

inline int numValue(TValue n) {
    return (intptr_t)n >> 1;
}

#ifdef PXT_BOX_DEBUG
inline bool canBeTagged(int) {
    return false;
}
#else
inline bool canBeTagged(int v) {
    return (v << 1) >> 1 == v;
}
#endif

typedef enum {
    PANIC_CODAL_OOM = 20,
    PANIC_GC_OOM = 21,
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

    PANIC_CAST_FIRST = 980,
    PANIC_CAST_FROM_UNDEFINED = 980,
    PANIC_CAST_FROM_BOOLEAN = 981,
    PANIC_CAST_FROM_NUMBER = 982,
    PANIC_CAST_FROM_STRING = 983,
    PANIC_CAST_FROM_OBJECT = 984,
    PANIC_CAST_FROM_FUNCTION = 985,
    PANIC_CAST_FROM_NULL = 989,

} PXT_PANIC;

extern const unsigned functionsAndBytecode[];
extern TValue *globals;
extern uint16_t *bytecode;
class RefRecord;

// Utility functions

typedef TValue (*RunActionType)(Action a, TValue arg0, TValue arg1, TValue arg2);
typedef TValue (*GetPropertyType)(TValue obj, unsigned key);
typedef TValue (*SetPropertyType)(TValue obj, unsigned key, TValue v);

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
struct VTable;

//%
Action mkAction(int totallen, RefAction *act);
//%
int templateHash();
//%
int programHash();
//%
unsigned programSize();
//%
int getNumGlobals();
//%
RefRecord *mkClassInstance(VTable *vt);
//%
void debugMemLeaks();
//%
void anyPrint(TValue v);

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
void failedCast(TValue v);
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
};
HandlerBinding *findBinding(int source, int value);
void setBinding(int source, int value, Action act);

// The standard calling convention is:
//   - when a pointer is loaded from a local/global/field etc, and incr()ed
//     (in other words, its presence on stack counts as a reference)
//   - after a function call, all pointers are popped off the stack and decr()ed
// This does not apply to the RefRecord and st/ld(ref) methods - they unref()
// the RefRecord* this.
//%
TValue incr(TValue e);
//%
void decr(TValue e);

#ifdef PXT_GC
inline TValue incr(TValue e) {
    return e;
}
inline void decr(TValue e) {}
#endif

class RefObject;

static inline RefObject *incrRC(RefObject *r) {
    return (RefObject *)incr((TValue)r);
}
static inline void decrRC(RefObject *r) {
    decr((TValue)r);
}

inline void *ptrOfLiteral(int offset) {
    return &bytecode[offset];
}

// Checks if object is ref-counted, and has a custom PXT vtable in front
// TODO
inline bool isRefCounted(TValue e) {
#ifdef PXT_GC
    return !isTagged(e);
#else
    return !isTagged(e) && (*((uint16_t *)e) & 1) == 1;
#endif
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
    User0 = 16,
};

struct VTable {
    uint16_t numbytes;
    ValType objectType;
    uint8_t magic;
    PVoid *ifaceTable;
    BuiltInType classNo;
    uint16_t reserved;
    uint32_t ifaceHashMult;
    // we only use the first few methods here; pxt will generate more
#ifdef PXT_GC
    PVoid methods[5];
#else
    PVoid methods[3];
#endif
};

//%
extern const VTable string_vt;
//%
extern const VTable buffer_vt;
//%
extern const VTable number_vt;
//%
extern const VTable RefAction_vtable;

#ifdef PXT_GC
#define PXT_VTABLE_TO_INT(vt) ((uintptr_t)(vt))
#else
#define PXT_VTABLE_TO_INT(vt) ((uintptr_t)(vt) >> PXT_VTABLE_SHIFT)
#endif

#ifdef PXT_GC
inline bool isReadOnly(TValue v) {
    return isTagged(v) || !((uint32_t)v >> 28);
}
#endif

#ifdef PXT_GC
#define REFCNT(x) 0
#else
#define REFCNT(x) ((x)->refcnt)
#endif

// A base abstract class for ref-counted objects.
class RefObject {
  public:
#ifdef PXT_GC
    uint32_t vtable;

    RefObject(const VTable *vt) { vtable = PXT_VTABLE_TO_INT(vt); }
#else
    uint16_t refcnt;
    uint16_t vtable;

    RefObject(const VTable *vt) {
        refcnt = 3;
        vtable = PXT_VTABLE_TO_INT(vt);
    }
#endif

    void destroyVT();
    void printVT();

#ifdef PXT_GC
    inline void ref() {}
    inline void unref() {}
    inline bool isReadOnly() { return pxt::isReadOnly((TValue)this); }
#else
    inline bool isReadOnly() { return refcnt == PXT_REFCNT_FLASH; }

    // Increment/decrement the ref-count. Decrementing to zero deletes the current object.
    inline void ref() {
        if (isReadOnly())
            return;
        MEMDBG2("INCR: %p refs=%d", this, this->refcnt);
        check(refcnt > 1, PANIC_REF_DELETED);
        refcnt += 2;
    }

    inline void unref() {
        if (isReadOnly())
            return;
        MEMDBG2("DECR: %p refs=%d", this, this->refcnt);
        check(refcnt > 1, PANIC_REF_DELETED);
        check((refcnt & 1), PANIC_REF_DELETED);
        refcnt -= 2;
        if (refcnt == 1) {
            MEMDBG("DEL: %p", this);
            destroyVT();
        }
    }
#endif
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

class BoxedString;
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
#ifdef PXT_GC
    return (VTable *)(r->vtable & ~1);
#else
    return (VTable *)((uintptr_t)r->vtable << PXT_VTABLE_SHIFT);
#endif
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
    uint16_t reserved;
    ActionCB func; // The function pointer
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
    uint16_t length;
    char data[0];
    BoxedString() : RefObject(&string_vt) {}
};

class BoxedBuffer : public RefObject {
  public:
    // data needs to be word-aligned, so we use 32 bits for length
    int length;
    uint8_t data[0];
    BoxedBuffer() : RefObject(&buffer_vt) {}
};

// the first byte of data indicates the format - currently 0xE1 or 0xE4 to 1 or 4 bit bitmaps
// second byte indicates width in pixels
// third byte indicates the height (which should also match the size of the buffer)
// just like ordinary buffers, these can be layed out in flash
class RefImage : public RefObject {
    uintptr_t _buffer;
    uint8_t _data[0];

  public:
    RefImage(BoxedBuffer *buf);
    RefImage(uint32_t sz);

    bool hasBuffer() { return !(_buffer & 1); }
    BoxedBuffer *buffer() { return hasBuffer() ? (BoxedBuffer *)_buffer : NULL; }
    void setBuffer(BoxedBuffer *b);
    bool isDirty() { return (_buffer & 3) == 3; }
    void clearDirty() {
        if (isDirty())
            _buffer &= ~2;
    }

    uint8_t *data() { return hasBuffer() ? buffer()->data : _data; }
    int length() { return hasBuffer() ? buffer()->length : (_buffer >> 2); }
    int pixLength() { return length() - 4; }

    int height();
    int width();
    int byteHeight();
    int wordHeight();
    int bpp();

    bool hasPadding() { return (height() & 0x1f) != 0; }

    uint8_t *pix() { return data() + 4; }
    uint8_t *pix(int x, int y);
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

// data can be NULL in both cases
String mkString(const char *data, int len = -1);
Buffer mkBuffer(const uint8_t *data, int len);

TNumber getNumberCore(uint8_t *buf, int size, NumberFormat format);
void setNumberCore(uint8_t *buf, int size, NumberFormat format, TNumber value);

void seedRandom(unsigned seed);
// max is inclusive
unsigned getRandom(unsigned max);

ValType valType(TValue v);

#ifdef PXT_GC
void registerGC(TValue *root, int numwords = 1);
void unregisterGC(TValue *root, int numwords = 1);
void registerGCPtr(TValue ptr);
void unregisterGCPtr(TValue ptr);
void gc(int flags);
#else
inline void registerGC(TValue *root, int numwords = 1) {}
inline void unregisterGC(TValue *root, int numwords = 1) {}
inline void registerGCPtr(TValue ptr) {}
inline void unregisterGCPtr(TValue ptr) {}
inline void gc(int) {}
#endif

struct StackSegment {
    void *top;
    void *bottom;
    StackSegment *next;
};

struct ThreadContext {
    TValue *globals;
    StackSegment stack;
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

void *gcAllocate(int numbytes);
void *gcAllocateArray(int numbytes);
void *gcPermAllocate(int numbytes);
#ifndef PXT_GC
inline void *gcAllocate(int numbytes) {
    return xmalloc(numbytes);
}
#endif

enum class PerfCounters {
    GC,
};

#ifdef PXT_PROFILE
#ifndef PERF_NOW
#error "missing platform timer support"
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

} // namespace pxt

#define PXT_DEF_STRING(name, val)                                                                  \
    static const char name[] __attribute__((aligned(4))) = "@PXT@:" val;

using namespace pxt;

namespace numops {
//%
String toString(TValue v);
//%
int toBool(TValue v);
//%
int toBoolDecr(TValue v);
} // namespace numops

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

#define NEW_GC(T) new (gcAllocate(sizeof(T))) T()

// The ARM Thumb generator in the JavaScript code is parsing
// the hex file and looks for the magic numbers as present here.
//
// Then it fetches function pointer addresses from there.
//
// The vtable pointers are there, so that the ::emptyData for various types
// can be patched with the right vtable.
//
#define PXT_SHIMS_BEGIN                                                                            \
    namespace pxt {                                                                                \
    const unsigned functionsAndBytecode[]                                                          \
        __attribute__((aligned(0x20))) = {0x08010801, 0x42424242, 0x08010801, 0x8de9d83e,

#define PXT_SHIMS_END                                                                              \
    }                                                                                              \
    ;                                                                                              \
    }

#ifndef X86_64
#pragma GCC diagnostic ignored "-Wpmf-conversions"
#endif

#define DEF_VTABLE(name, tp, valtype, ...)                                                         \
    const VTable name __attribute__((aligned(1 << PXT_VTABLE_SHIFT))) = {                          \
        sizeof(tp), valtype, VTABLE_MAGIC, 0, BuiltInType::tp, 0, 0, {__VA_ARGS__}};

#ifdef PXT_GC
#define PXT_VTABLE(classname)                                                                      \
    DEF_VTABLE(classname##_vtable, classname, ValType::Object, (void *)&classname::destroy,        \
               (void *)&classname::print, (void *)&classname::scan, (void *)&classname::gcsize)
#else
#define PXT_VTABLE(classname)                                                                      \
    DEF_VTABLE(classname##_vtable, classname, ValType::Object, (void *)&classname::destroy,        \
               (void *)&classname::print)
#endif

#define PXT_VTABLE_INIT(classname) RefObject(&classname##_vtable)

#define PXT_VTABLE_CTOR(classname)                                                                 \
    PXT_VTABLE(classname)                                                                          \
    classname::classname() : PXT_VTABLE_INIT(classname)

#define PXT_MAIN                                                                                   \
    int main() {                                                                                   \
        pxt::start();                                                                              \
        return 0;                                                                                  \
    }

#define PXT_FNPTR(x) (unsigned)(void *)(x)

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

#endif

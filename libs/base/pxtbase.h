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

#define intcheck(...) check(__VA_ARGS__)
//#define intcheck(...) do {} while (0)

#include <string.h>
#include <stdint.h>
#include <math.h>

#ifdef POKY
void* operator new (size_t size, void* ptr);
void* operator new (size_t size);
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
#define ramint_t uint32_t
#else
#define ramint_t uint16_t
#endif
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

//%
TValue runAction3(Action a, TValue arg0, TValue arg1, TValue arg2);
//%
TValue runAction2(Action a, TValue arg0, TValue arg1);
//%
TValue runAction1(Action a, TValue arg0);
//%
TValue runAction0(Action a);
//%
Action mkAction(int reflen, int totallen, int startptr);
// allocate [sz] words and clear them
//%
unsigned *allocate(ramint_t sz);
//%
int templateHash();
//%
int programHash();
//%
unsigned programSize();
//%
int getNumGlobals();
//%
RefRecord *mkClassInstance(int vtableOffset);
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
double toDouble(TNumber v);
//%
float toFloat(TNumber v);
//%
TNumber fromDouble(double r);
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
    return !isTagged(e) && (*((uint16_t *)e) & 1) == 1;
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
typedef void *PVoid;
typedef void **PPVoid;

typedef void *Object_;

const PPVoid RefMapMarker = (PPVoid)(void *)43;

struct VTable {
    uint16_t numbytes; // in the entire object, including the vtable pointer
    uint16_t userdata;
    PVoid *ifaceTable;
    uint16_t classNo;
    uint16_t reserved;
    PVoid methods[3]; // we only use up to three methods here; pxt will generate more
                      // refmask sits at &methods[nummethods]
};

const int vtableShift = PXT_VTABLE_SHIFT;

#ifdef PXT_GC
inline bool isReadOnly(TValue v) {
    return isTagged(v) || ((uint32_t)v >> 26);
}
#endif

// A base abstract class for ref-counted objects.
class RefObject {
  public:
#ifdef PXT_GC
    uint32_t vtable;

    // this is a getter, yay C++11!
    class {
        public:
            operator uint16_t () const { return 0; }
    } refcnt;

    RefObject(uint32_t vt) {
        vtable = vt;
    }
#else
    uint16_t refcnt;
    uint16_t vtable;

    RefObject(uint16_t vt) {
        refcnt = 3;
        vtable = vt;
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
    static constexpr ramint_t MaxSize = (((1U << (8 * sizeof(ramint_t) - 1)) - 1) << 1) + 1;
    static constexpr TValue DefaultValue = TAG_UNDEFINED;

    static ramint_t growthFactor(ramint_t size);
    void growByMin(ramint_t minSize);
    void growBy(ramint_t newSize);
    void ensure(ramint_t newSize);

  public:
    Segment() : data(nullptr), length(0), size(0){};

    TValue get(unsigned i);
    void set(unsigned i, TValue value);
    void setRef(unsigned i, TValue value);

    unsigned getLength() { return length; };
    void setLength(unsigned newLength);
    void resize(unsigned newLength) { setLength(newLength); }

    void push(TValue value);
    TValue pop();

    TValue remove(unsigned i);
    void insert(unsigned i, TValue value);

    bool isValidIndex(unsigned i);

    void destroy();

    void print();

    TValue *getData() {
        return data;
    }
};

// A ref-counted collection of either primitive or ref-counted objects (String, Image,
// user-defined record, another collection)
class RefCollection : public RefObject {
  private:
    Segment head;

  public:
    RefCollection();

    static void destroy(RefCollection *coll);
    static void print(RefCollection *coll);

    unsigned length() { return head.getLength(); }
    void setLength(unsigned newLength) { head.setLength(newLength); }

    void push(TValue x);
    TValue pop();
    TValue getAt(int i);
    void setAt(int i, TValue x);
    // removes the element at index i and shifts the other elements left
    TValue removeAt(int i);
    // inserts the element at index i and moves the other elements right.
    void insertAt(int i, TValue x);

    int indexOf(TValue x, int start);
    bool removeElement(TValue x);

    TValue *getData() { return head.getData(); }
};

class BoxedString;
class RefMap : public RefObject {
  public:
    Segment keys;
    Segment values;

    RefMap();
    static void destroy(RefMap *map);
    static void print(RefMap *map);
    int findIdx(BoxedString *key);
};

// A ref-counted, user-defined JS object.
class RefRecord : public RefObject {
  public:
    // The object is allocated, so that there is space at the end for the fields.
    TValue fields[];

    RefRecord(uint16_t v) : RefObject(v) {}

    TValue ld(int idx);
    TValue ldref(int idx);
    void st(int idx, TValue v);
    void stref(int idx, TValue v);
};

//%
VTable *getVTable(RefObject *r);

static inline VTable *getAnyVTable(TValue v) {
    return isRefCounted(v) ? getVTable((RefObject*)v) : NULL;
}

// these are needed when constructing vtables for user-defined classes
//%
void RefRecord_destroy(RefRecord *r);
//%
void RefRecord_print(RefRecord *r);

class RefAction;
typedef TValue (*ActionCB)(TValue *captured, TValue arg0, TValue arg1, TValue arg2);

// Ref-counted function pointer.
class RefAction : public RefObject {
  public:
    // This is the same as for RefRecord.
    uint8_t len;
    uint8_t reflen;
    ActionCB func; // The function pointer
    // fields[] contain captured locals
    TValue fields[];

    static void destroy(RefAction *act);
    static void print(RefAction *act);

    RefAction();

    inline void stCore(int idx, TValue v) {
        // DMESG("ST [%d] = %d ", idx, v); this->print();
        intcheck(0 <= idx && idx < len, PANIC_OUT_OF_BOUNDS, 10);
        intcheck(fields[idx] == 0, PANIC_OUT_OF_BOUNDS, 11); // only one assignment permitted
        fields[idx] = v;
    }

    inline TValue runCore(TValue arg0, TValue arg1,
                          TValue arg2) // internal; use runAction*() functions
    {
        this->ref();
        TValue r = this->func(&this->fields[0], arg0, arg1, arg2);
        this->unref();
        return r;
    }
};

// These two are used to represent locals written from inside inline functions
class RefLocal : public RefObject {
  public:
    TValue v;
    static void destroy(RefLocal *l);
    static void print(RefLocal *l);
    RefLocal();
};

class RefRefLocal : public RefObject {
  public:
    TValue v;
    static void destroy(RefRefLocal *l);
    static void print(RefRefLocal *l);
    RefRefLocal();
};

typedef int color;

// note: this is hardcoded in PXT (hexfile.ts)

#define PXT_REF_TAG_STRING 1
#define PXT_REF_TAG_BUFFER 2
#define PXT_REF_TAG_IMAGE 3
#define PXT_REF_TAG_NUMBER 32
#define PXT_REF_TAG_ACTION 33

class BoxedNumber : public RefObject {
  public:
    double num;
    BoxedNumber() : RefObject(PXT_REF_TAG_NUMBER) {}
} __attribute__((packed));

class BoxedString : public RefObject {
  public:
    uint16_t length;
    char data[0];
    BoxedString() : RefObject(PXT_REF_TAG_STRING) {}
};

class BoxedBuffer : public RefObject {
  public:
    // data needs to be word-aligned, so we use 32 bits for length
    int length;
    uint8_t data[0];
    BoxedBuffer() : RefObject(PXT_REF_TAG_BUFFER) {}
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
    void clearDirty() { if (isDirty()) _buffer &= ~2; }

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

TNumber mkNaN();

void seedRandom(unsigned seed);
// max is inclusive
unsigned getRandom(unsigned max);

extern const VTable string_vt;
extern const VTable image_vt;
extern const VTable buffer_vt;
extern const VTable number_vt;
extern const VTable RefAction_vtable;

enum class ValType {
    Undefined,
    Boolean,
    Number,
    String,
    Object,
    Function,
};

ValType valType(TValue v);


#ifdef PXT_GC
void registerGC(TValue *root, int numwords = 1);
void unregisterGC(TValue *root, int numwords = 1);
void registerGCPtr(TValue ptr);
void unregisterGCPtr(TValue ptr);
#else
inline void registerGC(TValue *root, int numwords = 1) {}
inline void unregisterGC(TValue *root, int numwords = 1) {}
inline void registerGCPtr(TValue ptr) {}
inline void unregisterGCPtr(TValue ptr) {}
#endif

struct StackSegment {
    void *top;
    void *bottom;
    StackSegment *next;
};

struct ThreadContext {
    TValue *globals;
    StackSegment stack;
    void *fiber;
    ThreadContext *next;
    ThreadContext *prev;
};

void releaseThreadContext(ThreadContext *ctx);
ThreadContext *getThreadContext();
void setThreadContext(ThreadContext *ctx);
void *getCurrentFiber();
void *threadAddressFor(ThreadContext *ctx, void *sp);

extern ThreadContext *threadContexts;


} // namespace pxt

#define PXT_DEF_STRING(name, val)                                                                  \
    static const char name[] __attribute__((aligned(4))) = "\xfe\xff\x01\x00" val;

using namespace pxt;

namespace numops {
//%
String stringConv(TValue v);
//%
String toString(TValue v);
}

namespace pins {
Buffer createBuffer(int size);
}

namespace String_ {
//%
int compare(TValue a, TValue b);
}

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

#define PXT_VTABLE_TO_INT(vt) ((uintptr_t)(vt) >> vtableShift)
#define PXT_VTABLE_BEGIN(classname, flags, iface)                                                  \
    const VTable classname##_vtable __attribute__((aligned(1 << vtableShift))) = {                 \
        sizeof(classname), flags, iface, 0, 0, {(void *)&classname::destroy, (void *)&classname::print,

#define PXT_VTABLE_END                                                                             \
    }                                                                                              \
    }                                                                                              \
    ;

#define PXT_VTABLE_INIT(classname) RefObject(PXT_VTABLE_TO_INT(&classname##_vtable))

#define PXT_VTABLE_CTOR(classname)                                                                 \
    PXT_VTABLE_BEGIN(classname, 0, 0)                                                              \
    PXT_VTABLE_END classname::classname() : PXT_VTABLE_INIT(classname)

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

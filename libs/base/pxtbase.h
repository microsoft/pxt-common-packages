#ifndef __PXTBASE_H
#define __PXTBASE_H

//#define PXT_MEMLEAK_DEBUG 1

#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wformat"
#pragma GCC diagnostic ignored "-Warray-bounds"

// needed for gcc6; not sure why
#undef min
#undef max

#include "pxtconfig.h"

#define intcheck(...) check(__VA_ARGS__)
//#define intcheck(...) do {} while (0)

#include <string.h>
#include <stdint.h>
#include <math.h>

#include <new>

#ifdef PXT_MEMLEAK_DEBUG
#include <set>
#endif

#include "pxtcore.h"

#define CONCAT_1(a, b) a##b
#define CONCAT_0(a, b) CONCAT_1(a, b)
#define STATIC_ASSERT(e) enum { CONCAT_0(_static_assert_, __LINE__) = 1 / ((e) ? 1 : 0) };

#if 0
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
// Tagged values
//
struct TValueStruct {};
typedef TValueStruct *TValue;
typedef TValue TNumber;
typedef TValue Action;
typedef TValue ImageLiteral;

// To be implemented by the target
extern "C" void target_panic(int error_code);
extern "C" void target_reset();
void sleep_ms(uint32_t ms);
void sleep_us(uint64_t us);
int current_time_ms();
void initRuntime();
void sendSerial(const char *data, int len);
int getSerialNumber();
void registerWithDal(int id, int event, Action a);
void runInBackground(Action a);
void runForever(Action a);
void waitForEvent(int id, int event);
//%
uint32_t afterProgramPage();
//%
void dumpDmesg();

// also defined DMESG macro
// end

#define TAGGED_SPECIAL(n) (TValue)(void *)((n << 2) | 2)
#define TAG_FALSE TAGGED_SPECIAL(2)
#define TAG_TRUE TAGGED_SPECIAL(16)
#define TAG_UNDEFINED (TValue)0
#define TAG_NULL TAGGED_SPECIAL(1)
#define TAG_NUMBER(n) (TNumber)(void *)((n << 1) | 1)

inline bool isTagged(TValue v) {
    return !v || ((int)v & 3);
}

inline bool isNumber(TValue v) {
    return (int)v & 1;
}

inline bool isSpecial(TValue v) {
    return (int)v & 2;
}

inline bool bothNumbers(TValue a, TValue b) {
    return (int)a & (int)b & 1;
}

inline int numValue(TValue n) {
    return (int)n >> 1;
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
    ERR_INVALID_BINARY_HEADER = 5,
    ERR_OUT_OF_BOUNDS = 8,
    ERR_REF_DELETED = 7,
    ERR_SIZE = 9,
} ERROR;

extern const uint32_t functionsAndBytecode[];
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
uint32_t *allocate(uint16_t sz);
//%
int templateHash();
//%
int programHash();
//%
uint32_t programSize();
//%
int getNumGlobals();
//%
RefRecord *mkClassInstance(int vtableOffset);
//%
void debugMemLeaks();
//%
void anyPrint(TValue v);

//%
int toInt(TNumber v);
//%
uint32_t toUInt(TNumber v);
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
TNumber fromUInt(uint32_t v);
//%
TValue fromBool(bool v);
//%
bool eq_bool(TValue a, TValue b);
//%
bool eqq_bool(TValue a, TValue b);

void error(ERROR code, int subcode = 0);
void exec_binary(uint16_t *pc);
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
inline bool isRefCounted(TValue e) {
    return !isTagged(e) && (*((uint32_t *)e) & 1) == 1;
}

inline void check(int cond, ERROR code, int subcode = 0) {
    if (!cond)
        error(code, subcode);
}

inline void oops() {
    target_panic(47);
}

class RefObject;
#ifdef PXT_MEMLEAK_DEBUG
extern std::set<TValue> allptrs;
#endif

typedef void (*RefObjectMethod)(RefObject *self);
typedef void *PVoid;
typedef void **PPVoid;

const PPVoid RefMapMarker = (PPVoid)(void *)43;

struct VTable {
    uint16_t numbytes; // in the entire object, including the vtable pointer
    uint16_t userdata;
    PVoid *ifaceTable;
    PVoid methods[2]; // we only use up to two methods here; pxt will generate more
                      // refmask sits at &methods[nummethods]
};

const int vtableShift = 2;

// A base abstract class for ref-counted objects.
class RefObject {
  public:
    uint16_t refcnt;
    uint16_t vtable;

    RefObject(uint16_t vt) {
        refcnt = 3;
        vtable = vt;
#ifdef PXT_MEMLEAK_DEBUG
        allptrs.insert((TValue)this);
#endif
    }

    void destroyVT();
    void printVT();

    // Call to disable pointer tracking on the current instance (in destructor or some other hack)
    inline void untrack() {
#ifdef PXT_MEMLEAK_DEBUG
        allptrs.erase((TValue)this);
#endif
    }

    // Increment/decrement the ref-count. Decrementing to zero deletes the current object.
    inline void ref() {
        if (refcnt == 0xffff)
            return;
        check(refcnt > 1, ERR_REF_DELETED);
        // DMESG("INCR "); this->print();
        refcnt += 2;
    }

    inline void unref() {
        if (refcnt == 0xffff)
            return;
        check(refcnt > 1, ERR_REF_DELETED);
        check((refcnt & 1), ERR_REF_DELETED);
        // DMESG("DECR "); this->print();
        refcnt -= 2;
        if (refcnt == 1) {
            untrack();
            destroyVT();
        }
    }
};

class Segment {
  private:
    TValue *data;
    uint16_t length;
    uint16_t size;

    static constexpr uint16_t MaxSize = 0xFFFF;
    static constexpr TValue DefaultValue = TAG_UNDEFINED;

    static uint16_t growthFactor(uint16_t size);
    void growByMin(uint16_t minSize);
    void growBy(uint16_t newSize);
    void ensure(uint16_t newSize);

  public:
    Segment() : data(nullptr), length(0), size(0){};

    TValue get(uint32_t i);
    void set(uint32_t i, TValue value);
    void setRef(uint32_t i, TValue value);

    uint32_t getLength() { return length; };
    void setLength(uint32_t newLength);
    void resize(uint32_t newLength) { setLength(newLength); }

    void push(TValue value);
    TValue pop();

    TValue remove(uint32_t i);
    void insert(uint32_t i, TValue value);

    bool isValidIndex(uint32_t i);

    void destroy();

    void print();
};

// A ref-counted collection of either primitive or ref-counted objects (String, Image,
// user-defined record, another collection)
class RefCollection : public RefObject {
  private:
    Segment head;

  public:
    RefCollection();

    void destroy();
    void print();

    uint32_t length() { return head.getLength(); }
    void setLength(uint32_t newLength) { head.setLength(newLength); }

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
};

class RefMap : public RefObject {
  public:
    Segment keys;
    Segment values;

    RefMap();
    void destroy();
    void print();
    int findIdx(uint32_t key);
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

    void destroy();
    void print();

    RefAction();

    inline void stCore(int idx, TValue v) {
        // DMESG("ST [%d] = %d ", idx, v); this->print();
        intcheck(0 <= idx && idx < len, ERR_OUT_OF_BOUNDS, 10);
        intcheck(fields[idx] == 0, ERR_OUT_OF_BOUNDS, 11); // only one assignment permitted
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
    void destroy();
    void print();
    RefLocal();
};

class RefRefLocal : public RefObject {
  public:
    TValue v;
    void destroy();
    void print();
    RefRefLocal();
};

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
    uint16_t length;
    uint8_t data[0];
    BoxedBuffer() : RefObject(PXT_REF_TAG_BUFFER) {}
};

typedef BoxedBuffer *Buffer;
typedef BoxedString *String;

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
void seedRandom(uint32_t seed);
// max is inclusive
uint32_t getRandom(uint32_t max);

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
}

// The initial six bytes of the strings (@PXT@:) are rewritten
// to the proper ref-count and vtable pointer
#define PXT_DEF_STRING(name, val)                                                                  \
    static const char name[] __attribute__((aligned(4))) = "@PXT@:" val;

using namespace pxt;

namespace pins {
Buffer createBuffer(int size);
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
    const uint32_t functionsAndBytecode[]                                                          \
        __attribute__((aligned(0x20))) = {0x08010801, 0x42424242, 0x08010801, 0x8de9d83e,

#define PXT_SHIMS_END                                                                              \
    }                                                                                              \
    ;                                                                                              \
    }

#pragma GCC diagnostic ignored "-Wpmf-conversions"

#define PXT_VTABLE_TO_INT(vt) ((uint32_t)(vt) >> vtableShift)
#define PXT_VTABLE_BEGIN(classname, flags, iface)                                                  \
    const VTable classname##_vtable __attribute__((aligned(1 << vtableShift))) = {                 \
        sizeof(classname), flags, iface, {(void *)&classname::destroy, (void *)&classname::print,

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

#define PXT_FNPTR(x) (uint32_t)(void *)(x)

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

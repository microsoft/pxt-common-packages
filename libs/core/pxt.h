#ifndef __PXT_H
#define __PXT_H

//#define PXT_MEMLEAK_DEBUG 1

#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wformat"

#include "pxtconfig.h"

#include "DeviceConfig.h"
#include "DeviceHeapAllocator.h"
#include "CodalDevice.h"
#include "ErrorNo.h"
#include "DeviceTimer.h"
#include "Matrix4.h"
#include "CodalCompat.h"
#include "DeviceComponent.h"
#include "ManagedType.h"
#include "ManagedString.h"
#include "ManagedBuffer.h"
#include "DeviceEvent.h"
#include "NotifyEvents.h"
#include "DeviceButton.h"
#include "DevicePin.h"
#include "DeviceFiber.h"
#include "DeviceMessageBus.h"
#include "TouchSensor.h"
#include "DeviceImage.h"

#include "pins.h"
#include "devpins.h"
#include "hf2.h"

#define intcheck(...) check(__VA_ARGS__)
//#define intcheck(...) do {} while (0)

#define PAGE_SIZE 256

#include <string.h>
#include <vector>
#include <stdint.h>

#ifdef PXT_MEMLEAK_DEBUG
#include <set>
#endif

#define CONCAT_1(a, b) a##b
#define CONCAT_0(a, b) CONCAT_1(a, b)
#define STATIC_ASSERT(e) enum { CONCAT_0(_static_assert_, __LINE__) = 1 / ((e) ? 1 : 0) };

// extern MicroBit uBit;

namespace pxt {
//
// Tagged values
//
struct TValueStruct {};
typedef TValueStruct *TValue;
typedef TValue TNumber;

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

typedef TValue Action;
typedef TValue ImageLiteral;

extern CodalUSB usb;
extern HF2 hf2;

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
extern DeviceEvent lastEvent;
extern DeviceTimer devTimer;
extern DeviceMessageBus devMessageBus;
void registerWithDal(int id, int event, Action a);
void runInBackground(Action a);
void waitForEvent(int id, int event);
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
uint32_t afterProgramPage();
//%
int getNumGlobals();
//%
RefRecord *mkClassInstance(int vtableOffset);
//%
void debugMemLeaks();
//%
void anyPrint(TValue v);
//%
void dumpDmesg();

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

inline void *ptrOfLiteral(int offset) {
    return &bytecode[offset];
}

// Checks if object has a VTable, or if its RefCounted* from the runtime.
inline bool hasVTable(TValue e) {
    return (*((uint32_t *)e) & 1) == 0;
}

inline void check(int cond, ERROR code, int subcode = 0) {
    if (!cond)
        error(code, subcode);
}

inline void oops() {
    device.panic(47);
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
        refcnt = 2;
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
        check(refcnt > 0, ERR_REF_DELETED);
        // DMESG("INCR "); this->print();
        refcnt += 2;
    }

    inline void unref() {
        check(refcnt > 0, ERR_REF_DELETED);
        check(!(refcnt & 1), ERR_REF_DELETED);
        // DMESG("DECR "); this->print();
        refcnt -= 2;
        if (refcnt == 0) {
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

    uint32_t getLength() { return length; };
    void setLength(uint32_t newLength);

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

struct MapEntry {
    uint32_t key;
    TValue val;
};

class RefMap : public RefObject {
  public:
    std::vector<MapEntry> data;

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

// Ref-counted function pointer. It's currently always a ()=>void procedure pointer.
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

STATIC_ASSERT(REF_TAG_USER <= 32)
// note: this is hardcoded in PXT (hexfile.ts)
#define REF_TAG_NUMBER 32

struct BoxedNumber : RefCounted {
    double num;
} __attribute__((packed));

extern const VTable string_vt;
extern const VTable image_vt;
extern const VTable buffer_vt;
extern const VTable number_vt;

enum class ValType {
    Undefined,
    Boolean,
    Number,
    String,
    Object,
};

ValType valType(TValue v);
}

// The initial six bytes of the strings (@PXT@:) are rewritten
// to the proper ref-count and vtable pointer
#define PXT_DEF_STRING(name, val)                                                                  \
    static const char name[] __attribute__((aligned(4))) = "@PXT@:" val;

using namespace pxt;
typedef BufferData *Buffer;

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

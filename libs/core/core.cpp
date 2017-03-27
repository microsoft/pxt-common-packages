#include "pxt.h"
#include <limits.h>

namespace String_ {

//%
StringData *charAt(StringData *s, int pos) {
    return ManagedString((char)ManagedString(s).charAt(pos)).leakData();
}

//%
int charCodeAt(StringData *s, int index) {
    return ManagedString(s).charAt(index);
}

//%
StringData *concat(StringData *s, StringData *other) {
    ManagedString a(s), b(other);
    return (a + b).leakData();
}

//%
int compare(StringData *s, StringData *that) {
    int compareResult = strcmp(s->data, that->data);
    if (compareResult < 0)
        return -1;
    else if (compareResult > 0)
        return 1;
    return 0;
}

//%
int length(StringData *s) {
    return s->len;
}

//%
StringData *fromCharCode(int code) {
    return ManagedString((char)code).leakData();
}

//%
int toNumber(StringData *s) {
    return atoi(s->data);
}

//%
StringData *mkEmpty() {
    return ManagedString::EmptyString.leakData();
}

//%
StringData *substr(StringData *s, int start, int length) {
    if (length <= 0)
        return mkEmpty();
    if (start < 0)
        start = max(s->len + start, 0);
    length = min(length, s->len - start);
    ManagedString x(s);
    return x.substring(start, length).leakData();
}
}

namespace Boolean_ {
// Note that the representation of booleans stays the usual C-one.

PXT_DEF_STRING(sTrue, "true")
PXT_DEF_STRING(sFalse, "false")

//%
StringData *toString(bool v) {
    if (v) {
        return (StringData *)(void *)sTrue;
    } else {
        return (StringData *)(void *)sFalse;
    }
}

//%
bool bang(int v) {
    return v == 0;
}
}

namespace langsupp {

//%
int toInt(TNumber v) {
    int vv = (int)v;
    if (vv & 1)
        return vv >> 1;
    if (vv & 2) {
        if (vv >> 6)
            return 1;
        else
            return 0;
    }

    // TODO this probably doesn't follow JS semantics
    ValType t = valType(v);
    if (t == ValType::Number) {
        BoxedNumber *p = (BoxedNumber *)v;
        return (int)p->num;
    } else {
        return 0;
    }
}

//%
uint32_t toUInt(TNumber v) {
    if (((int)v) & 3 || valType(v) != ValType::Number)
        return toInt(v);
    // TODO this probably doesn't follow JS semantics
    BoxedNumber *p = (BoxedNumber *)v;
    return (uint32_t)p->num;
}

//%
double toDouble(TNumber v) {
    if (((int)v) & 3)
        return toInt(v);

    // TODO this probably doesn't follow JS semantics
    ValType t = valType(v);
    if (t == ValType::Number) {
        BoxedNumber *p = (BoxedNumber *)v;
        return p->num;
    } else {
        return 0; // TODO NaN?
    }
}

//%
float toFloat(TNumber v) {
    // TODO optimize?
    return (float)toDouble(v);
}

//%
TNumber fromDouble(double r) {
    int ri = ((int)r) << 1;
    if ((ri >> 1) == r)
        return (TNumber)(ri | 1);
    BoxedNumber *p = (BoxedNumber*)malloc(sizeof(BoxedNumber));
    p->init();
    p->vtablePtr = (int)(void*)&number_vt >> vtableShift;
    p->num = r;
    return (TNumber)p;
}

//%
TNumber fromFloat(float r) {
    // TODO optimize
    return fromDouble(r);
}

//%
TNumber fromInt(int v) {
    if (CAN_BE_TAGGED(v))
        return TAG_NUMBER(v);
    return fromDouble(v);
}

//%
TNumber fromUInt(uint32_t v) {
    if (v <= 0x3fffffff)
        return (TNumber)((v << 1) | 1);
    return fromDouble(v);
}

TNumber eqFixup(TNumber v) {
    if (v == TAG_NULL)
        return TAG_UNDEFINED;
    if (v == TAG_TRUE)
        return TAG_NUMBER(1);
    if (v == TAG_FALSE)
        return TAG_NUMBER(0);
    return v;
}

bool eq_bool(TNumber a, TNumber b) {
    a = eqFixup(a);
    b = eqFixup(b);
    if (a == b)
        return true;
    ValType ta = valType(a);
    ValType tb = valType(b);
    if (ta != tb)
        return false;

    if (ta == ValType::String)
        return String_::compare((StringData *)a, (StringData *)b) == 0;

    int aa = (int)a;
    int bb = (int)b;

    // if at least one of the values is tagged, they are not equal
    if ((aa | bb) & 3)
        return false;

    return toDouble(a) == toDouble(b);
}
}

#define NUMOP(op) return langsupp::fromDouble(langsupp::toDouble(a) op langsupp::toDouble(b));
#define BITOP(op) return langsupp::fromInt(langsupp::toInt(a) op langsupp::toInt(b));
namespace numops {

// The integer, non-overflow case for add/sub/bit opts is handled in assembly

//%
TNumber adds(TNumber a, TNumber b) {
    NUMOP(+)
}

//%
TNumber subs(TNumber a, TNumber b) {
    NUMOP(-)
}

//%
TNumber muls(TNumber a, TNumber b) {
    NUMOP(*)
}

//%
TNumber div(TNumber a, TNumber b) {
    NUMOP(/)
}

//%
TNumber mod(TNumber a, TNumber b) {
    // TODO this is wrong for doubles
    BITOP(%)
}

//%
TNumber lsls(TNumber a, TNumber b) {
    BITOP(<<)
}

//%
TNumber lsrs(TNumber a, TNumber b) {
    BITOP(>>)
}

//%
TNumber asrs(TNumber a, TNumber b) {
    return langsupp::fromUInt(langsupp::toUInt(a) >> langsupp::toUInt(b));
}

//%
TNumber eors(TNumber a, TNumber b) {
    BITOP (^)
}

//%
TNumber orrs(TNumber a, TNumber b) {
    BITOP(|)
}

//%
TNumber ands(TNumber a, TNumber b) {
    BITOP(&)
}

#define CMPOP_RAW(op)                                                                              \
    if (((int)a) & ((int)b) & 1)                                                                   \
        return (int)a op((int)b);                                                                  \
    return langsupp::toDouble(a) op langsupp::toDouble(b);

#define CMPOP(op)                                                                                  \
    if (((int)a) & ((int)b) & 1)                                                                   \
        return ((int)a op((int)b)) ? TAG_TRUE : TAG_FALSE;                                         \
    return langsupp::toDouble(a) op langsupp::toDouble(b) ? TAG_TRUE : TAG_FALSE;

//%
bool lt_bool(TNumber a, TNumber b) {
    CMPOP_RAW(<)
}

//%
TNumber le(TNumber a, TNumber b) {
    CMPOP(<=)
}

//%
TNumber lt(TNumber a, TNumber b) {
    CMPOP(<)
}

//%
TNumber ge(TNumber a, TNumber b) {
    CMPOP(>=)
}

//%
TNumber gt(TNumber a, TNumber b) {
    CMPOP(>)
}

//%
TNumber eq(TNumber a, TNumber b) {
    return langsupp::eq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

//%
TNumber neq(TNumber a, TNumber b) {
    return !langsupp::eq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}
}

namespace Math_ {
//%
int pow(int x, int y) {
    if (y < 0)
        return 0;
    int r = 1;
    while (y) {
        if (y & 1)
            r *= x;
        y >>= 1;
        x *= x;
    }
    return r;
}

//%
int random(int max) {
    if (max == INT_MIN)
        return -device.random(INT_MAX);
    else if (max < 0)
        return -device.random(-max);
    else if (max == 0)
        return 0;
    else
        return device.random(max);
}

//%
int sqrt(int x) {
    return ::sqrt(x);
}
}

namespace Array_ {
//%
RefCollection *mk(uint32_t flags) {
    return new RefCollection(flags);
}
//%
int length(RefCollection *c) {
    return c->length();
}
//%
void setLength(RefCollection *c, int newLength) {
    c->setLength(newLength);
}
//%
void push(RefCollection *c, uint32_t x) {
    c->push(x);
}
//%
uint32_t pop(RefCollection *c) {
    return c->pop();
}
//%
uint32_t getAt(RefCollection *c, int x) {
    return c->getAt(x);
}
//%
void setAt(RefCollection *c, int x, uint32_t y) {
    c->setAt(x, y);
}
//%
uint32_t removeAt(RefCollection *c, int x) {
    return c->removeAt(x);
}
//%
void insertAt(RefCollection *c, int x, uint32_t value) {
    c->insertAt(x, value);
}
//%
int indexOf(RefCollection *c, uint32_t x, int start) {
    return c->indexOf(x, start);
}
//%
int removeElement(RefCollection *c, uint32_t x) {
    return c->removeElement(x);
}
}

// Import some stuff directly
namespace pxt {

//%
uint32_t runAction3(Action a, int arg0, int arg1, int arg2);
//%
uint32_t runAction2(Action a, int arg0, int arg1);
//%
uint32_t runAction1(Action a, int arg0);
//%
uint32_t runAction0(Action a);
//%
Action mkAction(int reflen, int totallen, int startptr);
//%
RefRecord *mkClassInstance(int offset);
//%
void RefRecord_destroy(RefRecord *r);
//%
void RefRecord_print(RefRecord *r);
//%
void debugMemLeaks();
//%
int incr(uint32_t e);
//%
void decr(uint32_t e);
//%
uint32_t *allocate(uint16_t sz);
//%
int templateHash();
//%
int programHash();
//%
void *ptrOfLiteral(int offset);
//%
int getNumGlobals();

//%
uint32_t programSize() {
    return bytecode[17] * 2;
}

//%
uint32_t afterProgramPage() {
    uint32_t ptr = (uint32_t)&bytecode[0];
    ptr += programSize();
    ptr = (ptr + (PAGE_SIZE - 1)) & ~(PAGE_SIZE - 1);
    return ptr;
}
}

namespace pxtrt {
//%
uint32_t ldloc(RefLocal *r) {
    return r->v;
}

//%
uint32_t ldlocRef(RefRefLocal *r) {
    uint32_t tmp = r->v;
    incr(tmp);
    return tmp;
}

//%
void stloc(RefLocal *r, uint32_t v) {
    r->v = v;
}

//%
void stlocRef(RefRefLocal *r, uint32_t v) {
    decr(r->v);
    r->v = v;
}

//%
RefLocal *mkloc() {
    return new RefLocal();
}

//%
RefRefLocal *mklocRef() {
    return new RefRefLocal();
}

// All of the functions below unref() self. This is for performance reasons -
// the code emitter will not emit the unrefs for them.

//%
uint32_t ldfld(RefRecord *r, int idx) {
    uint32_t tmp = r->ld(idx);
    r->unref();
    return tmp;
}

//%
uint32_t ldfldRef(RefRecord *r, int idx) {
    uint32_t tmp = r->ldref(idx);
    r->unref();
    return tmp;
}

//%
void stfld(RefRecord *r, int idx, uint32_t val) {
    r->st(idx, val);
    r->unref();
}

//%
void stfldRef(RefRecord *r, int idx, uint32_t val) {
    r->stref(idx, val);
    r->unref();
}

// Store a captured local in a closure. It returns the action, so it can be chained.
//%
RefAction *stclo(RefAction *a, int idx, uint32_t v) {
    // DBG("STCLO "); a->print(); DBG("@%d = %p\n", idx, (void*)v);
    a->stCore(idx, v);
    return a;
}

//%
void panic(int code) {
    device.panic(code);
}

//%
int stringToBool(StringData *s) {
    if (s == NULL)
        return 0;
    if (s->len == 0) {
        s->decr();
        return 0;
    }
    s->decr();
    return 1;
}

//%
StringData *emptyToNull(StringData *s) {
    if (!s || s->len == 0)
        return NULL;
    return s;
}

//%
int ptrToBool(uint32_t p) {
    if (p) {
        decr(p);
        return 1;
    } else {
        return 0;
    }
}

//%
RefMap *mkMap() {
    return new RefMap();
}

//%
uint32_t mapGet(RefMap *map, uint32_t key) {
    int i = map->findIdx(key);
    if (i < 0) {
        map->unref();
        return 0;
    }
    uint32_t r = map->data[i].val;
    map->unref();
    return r;
}

//%
uint32_t mapGetRef(RefMap *map, uint32_t key) {
    int i = map->findIdx(key);
    if (i < 0) {
        map->unref();
        return 0;
    }
    uint32_t r = incr(map->data[i].val);
    map->unref();
    return r;
}

//%
void mapSet(RefMap *map, uint32_t key, uint32_t val) {
    int i = map->findIdx(key);
    if (i < 0) {
        map->data.push_back({key << 1, val});
    } else {
        if (map->data[i].key & 1) {
            decr(map->data[i].val);
            map->data[i].key = key << 1;
        }
        map->data[i].val = val;
    }
    map->unref();
}

//%
void mapSetRef(RefMap *map, uint32_t key, uint32_t val) {
    int i = map->findIdx(key);
    if (i < 0) {
        map->data.push_back({(key << 1) | 1, val});
    } else {
        if (map->data[i].key & 1) {
            decr(map->data[i].val);
        } else {
            map->data[i].key = (key << 1) | 1;
        }
        map->data[i].val = val;
    }
    map->unref();
}

//
// Debugger
//

//%
void *getGlobalsPtr() {
    return globals;
}

//%
void runtimeWarning(StringData *s) {
    // noop for now
}
}

namespace pxt {

//%
ValType valType(TValue v) {
    if ((int)v & 3) {
        if ((int)v & 1)
            return ValType::Number;
        if (v == TAG_TRUE || v == TAG_FALSE)
            return ValType::Boolean;
        else if (v == TAG_NULL)
            return ValType::Object;
        else {
            oops();
            return ValType::Object;
        }
    } else {
        if (!v)
            return ValType::Object;

        VTable *vt = (VTable *)(((RefCounted *)v)->vtablePtr << vtableShift);
        if (vt == &string_vt)
            return ValType::String;
        else if (vt == &number_vt)
            return ValType::Number;
        else
            return ValType::Object;
    }
}

PXT_DEF_STRING(sUndefined, "undefined")
PXT_DEF_STRING(sObject, "object")
PXT_DEF_STRING(sBoolean, "boolean")
PXT_DEF_STRING(sString, "string")
PXT_DEF_STRING(sNumber, "number")

//%
StringData *typeOf(TValue v) {
    switch (valType(v)) {
    case ValType::Undefined:
        return (StringData *)sUndefined;
    case ValType::Boolean:
        return (StringData *)sBoolean;
    case ValType::Number:
        return (StringData *)sNumber;
    case ValType::String:
        return (StringData *)sString;
    case ValType::Object:
        return (StringData *)sObject;
    default:
        oops();
        return 0;
    }
}

// Maybe in future we will want separate print methods; for now ignore

//%
void primitivePrint(TValue v) {
    // TODO
}

#define PRIM_VTABLE(name, sz)                                                                      \
    const VTable name                                                                              \
        __attribute__((aligned(1 << vtableShift))) = {sz,                                          \
                                                      0,                                           \
                                                      0,                                           \
                                                      {                                            \
                                                          (void *)&free, (void *)&primitivePrint,  \
                                                      }};
PRIM_VTABLE(string_vt, 0)
PRIM_VTABLE(image_vt, 0)
PRIM_VTABLE(buffer_vt, 0)
PRIM_VTABLE(number_vt, 12)
}

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
double toNumber(StringData *s) {
    // JSCHECK
    char *endptr;
    double v = strtod(s->data, &endptr);
    if (endptr != s->data + s->len)
        return NAN;
    if (v == 0.0 || v == -0.0)
        return v;
    if (!isnormal(v))
        return NAN;
    return v;
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
//%
bool bang(int v) {
    return v == 0;
}
}

namespace pxt {

// ES5 9.5, 9.6
uint32_t toUInt(TNumber v) {
    if (isNumber(v))
        return numValue(v);
    if (isSpecial(v)) {
        if ((int)v >> 6)
            return 1;
        else
            return 0;
    }
    if (!v)
        return 0;

    double num = toDouble(v);
    if (!isnormal(num))
        return 0;
    double rem = fmod(trunc(num), 4294967296.0);
    if (rem < 0.0)
        rem += 4294967296.0;
    return (uint32_t)rem;
}
int toInt(TNumber v) {
    return (int)toUInt(v);
}

double toDouble(TNumber v) {
    if (isTagged(v))
        return toInt(v);

    // JSCHECK
    ValType t = valType(v);
    if (t == ValType::Number) {
        BoxedNumber *p = (BoxedNumber *)v;
        return p->num;
    } else if (t == ValType::String) {
        return String_::toNumber((StringData *)v);
    } else {
        return NAN;
    }
}

float toFloat(TNumber v) {
    // TODO optimize?
    return (float)toDouble(v);
}

TNumber fromDouble(double r) {
#ifndef PXT_BOX_DEBUG
    int ri = ((int)r) << 1;
    if ((ri >> 1) == r)
        return (TNumber)(ri | 1);
#endif
    BoxedNumber *p = (BoxedNumber *)malloc(sizeof(BoxedNumber));
    p->init();
    p->tag = BoxedNumber::TAG;
    p->num = r;
    return (TNumber)p;
}

TNumber fromFloat(float r) {
    // TODO optimize
    return fromDouble(r);
}

TNumber fromInt(int v) {
    if (canBeTagged(v))
        return TAG_NUMBER(v);
    return fromDouble(v);
}

TNumber fromUInt(uint32_t v) {
#ifndef PXT_BOX_DEBUG
    if (v <= 0x3fffffff)
        return TAG_NUMBER(v);
#endif
    return fromDouble(v);
}

TValue fromBool(bool v) {
    if (v)
        return TAG_TRUE;
    else
        return TAG_FALSE;
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

bool eqq_bool(TValue a, TValue b) {
    // TODO improve this

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

    if (ta == ValType::Number)
        return toDouble(a) == toDouble(b);
    else
        return a == b;
}

bool eq_bool(TValue a, TValue b) {
    return eqq_bool(eqFixup(a), eqFixup(b));
}

//%
bool switch_eq(TValue a, TValue b) {
    if (eqq_bool(eqFixup(a), eqFixup(b))) {
        decr(b);
        return true;
    }
    return false;
}
}

namespace langsupp {
//%
TValue ptreq(TValue a, TValue b) {
    return eq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

//%
TValue ptreqq(TValue a, TValue b) {
    return eqq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

//%
TValue ptrneq(TValue a, TValue b) {
    return !eq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

//%
TValue ptrneqq(TValue a, TValue b) {
    return !eqq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}
}

#define NUMOP(op) return fromDouble(toDouble(a) op toDouble(b));
#define BITOP(op) return fromInt(toInt(a) op toInt(b));
namespace numops {

//%
int toBool(TValue v) {
    if (isTagged(v)) {
        if (v == TAG_UNDEFINED || v == TAG_NULL || v == TAG_FALSE || v == TAG_NUMBER(0))
            return 0;
        else
            return 1;
    }

    ValType t = valType(v);
    if (t == ValType::String) {
        StringData *s = (StringData *)v;
        if (s->len == 0)
            return 0;
    } else if (t == ValType::Number) {
        double x = toDouble(v);
        if (isnan(x) || x == 0.0 || x == -0.0)
            return 0;
        else
            return 1;
    }

    return 1;
}

//%
int toBoolDecr(TValue v) {
    int r = toBool(v);
    decr(v);
    return r;
}

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
    if (bothNumbers(a, b)) {
        int aa = (int)a;
        int bb = (int)b;
        // if both operands fit 15 bits, the result will not overflow int
        if ((aa >> 15 == 0 || aa >> 15 == -1) && (bb >> 15 == 0 || bb >> 15 == -1)) {
            // it may overflow 31 bit int though - use fromInt to convert properly
            return fromInt((aa >> 1) * (bb >> 1));
        }
    }
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
    return fromUInt(toUInt(a) >> toUInt(b));
}

//%
TNumber asrs(TNumber a, TNumber b) {
    BITOP(>>)
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
    if (bothNumbers(a, b))                                                                         \
        return (int)a op((int)b);                                                                  \
    return toDouble(a) op toDouble(b);

#define CMPOP(op)                                                                                  \
    if (bothNumbers(a, b))                                                                         \
        return ((int)a op((int)b)) ? TAG_TRUE : TAG_FALSE;                                         \
    return toDouble(a) op toDouble(b) ? TAG_TRUE : TAG_FALSE;

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
    return pxt::eq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

//%
TNumber neq(TNumber a, TNumber b) {
    return !pxt::eq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

//%
TNumber eqq(TNumber a, TNumber b) {
    return pxt::eqq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

//%
TNumber neqq(TNumber a, TNumber b) {
    return !pxt::eqq_bool(a, b) ? TAG_TRUE : TAG_FALSE;
}

PXT_DEF_STRING(sTrue, "true")
PXT_DEF_STRING(sFalse, "false")
PXT_DEF_STRING(sUndefined, "undefined")
PXT_DEF_STRING(sNull, "null")
PXT_DEF_STRING(sObject, "[Object]")

asm(".global _printf_float");
extern "C" char *gcvt(double d, int ndigit, char *buf);

//%
StringData *toString(TValue v) {
    if (v == TAG_UNDEFINED)
        return (StringData *)(void *)sUndefined;
    else if (v == TAG_FALSE)
        return (StringData *)(void *)sFalse;
    else if (v == TAG_TRUE)
        return (StringData *)(void *)sTrue;
    else if (v == TAG_NULL)
        return (StringData *)(void *)sNull;

    ValType t = valType(v);

    if (t == ValType::String) {
        return (StringData *)(void *)incr(v);
    } else if (t == ValType::Number) {
        char buf[64];
        // TODO fastpath for ints
        gcvt(toDouble(v), 10, buf);
        // snprintf() with doubles requires 8-byte stack alignment, which we do not provide (yet)
        // unsigned len = snprintf(buf, sizeof(buf), "%g", toDouble(v));
        // if (len >= sizeof(buf))
        //    return (StringData *)(void *)sObject; // overflow?
        ManagedString s(buf);
        return s.leakData();
    } else {
        return (StringData *)(void *)sObject;
    }
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
    return new RefCollection();
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
void push(RefCollection *c, TValue x) {
    c->push(x);
}
//%
TValue pop(RefCollection *c) {
    return c->pop();
}
//%
TValue getAt(RefCollection *c, int x) {
    return c->getAt(x);
}
//%
void setAt(RefCollection *c, int x, TValue y) {
    c->setAt(x, y);
}
//%
TValue removeAt(RefCollection *c, int x) {
    return c->removeAt(x);
}
//%
void insertAt(RefCollection *c, int x, TValue value) {
    c->insertAt(x, value);
}
//%
int indexOf(RefCollection *c, TValue x, int start) {
    return c->indexOf(x, start);
}
//%
bool removeElement(RefCollection *c, TValue x) {
    return c->removeElement(x);
}
}

namespace pxt {
//%
void *ptrOfLiteral(int offset);

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
TValue ldloc(RefLocal *r) {
    return r->v;
}

//%
TValue ldlocRef(RefRefLocal *r) {
    TValue tmp = r->v;
    incr(tmp);
    return tmp;
}

//%
void stloc(RefLocal *r, TValue v) {
    r->v = v;
}

//%
void stlocRef(RefRefLocal *r, TValue v) {
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
TValue ldfld(RefRecord *r, int idx) {
    TValue tmp = r->ld(idx);
    r->unref();
    return tmp;
}

//%
TValue ldfldRef(RefRecord *r, int idx) {
    TValue tmp = r->ldref(idx);
    r->unref();
    return tmp;
}

//%
void stfld(RefRecord *r, int idx, TValue val) {
    r->st(idx, val);
    r->unref();
}

//%
void stfldRef(RefRecord *r, int idx, TValue val) {
    r->stref(idx, val);
    r->unref();
}

// Store a captured local in a closure. It returns the action, so it can be chained.
//%
RefAction *stclo(RefAction *a, int idx, TValue v) {
    // DBG("STCLO "); a->print(); DBG("@%d = %p\n", idx, (void*)v);
    a->stCore(idx, v);
    return a;
}

//%
void panic(int code) {
    device.panic(code);
}

//%
StringData *emptyToNull(StringData *s) {
    if (!s || s->len == 0)
        return NULL;
    return s;
}

//%
int ptrToBool(TValue p) {
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
TValue mapGet(RefMap *map, uint32_t key) {
    int i = map->findIdx(key);
    if (i < 0) {
        map->unref();
        return 0;
    }
    TValue r = map->data[i].val;
    map->unref();
    return r;
}

//%
TValue mapGetRef(RefMap *map, uint32_t key) {
    int i = map->findIdx(key);
    if (i < 0) {
        map->unref();
        return 0;
    }
    TValue r = incr(map->data[i].val);
    map->unref();
    return r;
}

//%
void mapSet(RefMap *map, uint32_t key, TValue val) {
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
void mapSetRef(RefMap *map, uint32_t key, TValue val) {
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

void dumpDmesg() {
    hf2.sendSerial("\nDMESG:\n", 8);
    hf2.sendSerial(codalLogStore.buffer, codalLogStore.ptr);
    hf2.sendSerial("\n\n", 2);
}

//%
ValType valType(TValue v) {
    if (isTagged(v)) {
        if (!v)
            return ValType::Undefined;

        if (isNumber(v))
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
        int tag = ((RefCounted *)v)->tag;

        if (tag == ManagedString::TAG)
            return ValType::String;
        else if (tag == BoxedNumber::TAG)
            return ValType::Number;

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

void anyPrint(TValue v) {
    if (valType(v) == ValType::Object) {
        if (hasVTable(v)) {
            auto o = (RefObject *)v;
            auto meth = ((RefObjectMethod)getVTable(o)->methods[1]);
            if ((void *)meth == (void *)&anyPrint)
                DMESG("[RefObject refs=%d vt=%p]", o->refcnt, getVTable(o));
            else
                meth(o);
        } else {
            auto r = (RefCounted *)v;
            DMESG("[RefCounted refs=%d tag=%d]", r->refCount, r->tag);
        }
    } else {
        StringData *s = numops::toString(v);
        DMESG("[%s %p = %s]", pxt::typeOf(v)->data, v, s->data);
        decr((TValue)s);
    }
}

#define PRIM_VTABLE(name, sz)                                                                      \
    const VTable name = {sz,                                                                       \
                         0,                                                                        \
                         0,                                                                        \
                         {                                                                         \
                             0, (void *)&anyPrint,                                                 \
                         }};
PRIM_VTABLE(string_vt, 0)
PRIM_VTABLE(image_vt, 0)
PRIM_VTABLE(buffer_vt, 0)
PRIM_VTABLE(number_vt, 12)

static const VTable *primVtables[] = {0,          //
                                      &string_vt, // 1
                                      &buffer_vt, // 2
                                      &image_vt,  // 3
                                      0,          0, 0, 0, 0, 0,
                                      &number_vt, // 10
                                      0};

VTable *getVTable(RefObject *r) {
    if (r->vtable >= 11)
        return (VTable *)(r->vtable << vtableShift);
    return (VTable *)primVtables[r->vtable];
}
}

#include "pxtbase.h"
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
TNumber toNumber(StringData *s) {
    // JSCHECK
    char *endptr;
    double v = strtod(s->data, &endptr);
    if (endptr != s->data + s->len)
        v = NAN;
    else if (v == 0.0 || v == -0.0)
        v = v;
    else if (!isnormal(v))
        v = NAN;
    return fromDouble(v);
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
        return toDouble(String_::toNumber((StringData *)v));
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
    p->tag = REF_TAG_NUMBER;
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
    if (isNumber(a) && isNumber(b) && numValue(b))
        BITOP(%)
    return fromDouble(fmod(toDouble(a), toDouble(b)));
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
PXT_DEF_STRING(sFunction, "[Function]")
PXT_DEF_STRING(sNaN, "NaN")
PXT_DEF_STRING(sInf, "Infinity")
PXT_DEF_STRING(sMInf, "-Infinity")

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

        if (isNumber(v)) {
            int x = numValue(v);
            itoa(x, buf);
        } else {
            double x = toDouble(v);

            if (isnan(x))
                return (StringData *)(void *)sNaN;
            if (isinf(x)) {
                if (x < 0)
                    return (StringData *)(void *)sMInf;
                else
                    return (StringData *)(void *)sInf;
            }
            gcvt(x, 16, buf);
        }

        ManagedString s(buf);
        return s.leakData();
    } else if (t == ValType::Function) {
        return (StringData *)(void *)sFunction;
    } else {
        return (StringData *)(void *)sObject;
    }
}
}

namespace Math_ {
//%
TNumber pow(TNumber x, TNumber y) {
    return fromDouble(::pow(toDouble(x), toDouble(y)));
}

//%
TNumber atan2(TNumber y, TNumber x) {
    return fromDouble(::atan2(toDouble(y), toDouble(y)));
}

//%
TNumber random() {
    double r = device.random(INT_MAX) / (double)(INT_MAX - 1);
    double r2 = device.random(INT_MAX) / (double)(INT_MAX - 1);
    return fromDouble(r * r2);
}

//%
TNumber randomRange(TNumber min, TNumber max) {
    if (isNumber(min) && isNumber(max)) {
        int mini = numValue(min);
        int maxi = numValue(max);
        if (mini > maxi) {
            int temp = mini;
            mini = maxi;
            maxi = temp;
        }
        if (maxi == mini)
            return fromInt(mini);
        else 
            return fromInt(mini + device.random(maxi - mini + 1));
    }
    else {
        double mind = toDouble(min);
        double maxd = toDouble(max);
        if (mind > maxd) {
            double temp = mind;
            mind = maxd;
            maxd = temp;
        }
        if (maxd == mind)
            return fromDouble(mind);
        else {
            double r = device.random(INT_MAX) / (double)(INT_MAX - 1);
            double r2 = device.random(INT_MAX) / (double)(INT_MAX - 1);
            return fromDouble(mind + r * r2 * (maxd - mind));
        }
    }
}

#define SINGLE(op) return fromDouble(::op(toDouble(x)));

//%
TNumber log(TNumber x) {
    SINGLE(log)
}

//%
TNumber exp(TNumber x) {
    SINGLE(exp)
}

//%
TNumber tan(TNumber x) {
    SINGLE(tan)
}

//%
TNumber sin(TNumber x) {
    SINGLE(sin)
}

//%
TNumber cos(TNumber x) {
    SINGLE(cos)
}

//%
TNumber atan(TNumber x) {
    SINGLE(atan)
}

//%
TNumber asin(TNumber x) {
    SINGLE(asin)
}

//%
TNumber acos(TNumber x) {
    SINGLE(acos)
}

//%
TNumber sqrt(TNumber x) {
    SINGLE(sqrt)
}

//%
TNumber floor(TNumber x) {
    SINGLE(floor)
}

//%
TNumber ceil(TNumber x) {
    SINGLE(ceil)
}

//%
TNumber trunc(TNumber x) {
    SINGLE(trunc)
}

//%
TNumber round(TNumber x) {
    SINGLE(round)
}

//%
int imul(int x, int y) {
    return x * y;
}

//%
int idiv(int x, int y) {
    return x / y;
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
    target_panic(code);
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

        if (tag == REF_TAG_STRING)
            return ValType::String;
        else if (tag == REF_TAG_NUMBER)
            return ValType::Number;
        else if (tag == REF_TAG_ACTION || getVTable((RefObject*)v) == &RefAction_vtable)
            return ValType::Function;

        return ValType::Object;
    }
}

PXT_DEF_STRING(sObjectTp, "object")
PXT_DEF_STRING(sBooleanTp, "boolean")
PXT_DEF_STRING(sStringTp, "string")
PXT_DEF_STRING(sNumberTp, "number")
PXT_DEF_STRING(sFunctionTp, "function")
PXT_DEF_STRING(sUndefinedTp, "undefined")

//%
StringData *typeOf(TValue v) {
    switch (valType(v)) {
    case ValType::Undefined:
        return (StringData *)sUndefinedTp;
    case ValType::Boolean:
        return (StringData *)sBooleanTp;
    case ValType::Number:
        return (StringData *)sNumberTp;
    case ValType::String:
        return (StringData *)sStringTp;
    case ValType::Object:
        return (StringData *)sObjectTp;
    case ValType::Function:
        return (StringData *)sFunctionTp;
    default:
        oops();
        return 0;
    }
}

// Maybe in future we will want separate print methods; for now ignore
void anyPrint(TValue v) {
    if (valType(v) == ValType::Object) {
        if (isRefCounted(v)) {
            auto o = (RefObject *)v;
            auto meth = ((RefObjectMethod)getVTable(o)->methods[1]);
            if ((void *)meth == (void *)&anyPrint)
                DMESG("[RefObject refs=%d vt=%p]", o->refcnt, o->vtable);
            else
                meth(o);
        } else {
            DMESG("[Native %p]", v);
        }
    } else {
        StringData *s = numops::toString(v);
        DMESG("[%s %p = %s]", pxt::typeOf(v)->data, v, s->data);
        decr((TValue)s);
    }
}

void dtorDoNothing() {
}

#define PRIM_VTABLE(name, sz)                                                                      \
    const VTable name = {sz,                                                                       \
                         0,                                                                        \
                         0,                                                                        \
                         {                                                                         \
                             (void*)&dtorDoNothing, \
                             (void *)&anyPrint,                                                 \
                         }};
PRIM_VTABLE(string_vt, 0)
PRIM_VTABLE(image_vt, 0)
PRIM_VTABLE(buffer_vt, 0)
PRIM_VTABLE(number_vt, 12)
PRIM_VTABLE(action_vt, 0)

static const VTable *primVtables[] = {0,          // 0
                                      &string_vt, // 1
                                      &buffer_vt, // 2
                                      &image_vt,  // 3
                                      // filler:
                                      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                      0, 0, 0, 0, 0, 0, 0,
                                      &number_vt, // 32
                                      &action_vt, // 33
                                      0};

VTable *getVTable(RefObject *r) {
    if (r->vtable >= 34)
        return (VTable *)(r->vtable << vtableShift);
    if (r->vtable == 0)
        target_panic(100);
    return (VTable *)primVtables[r->vtable];
}
}

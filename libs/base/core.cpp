#include "pxtbase.h"
#include <limits.h>
#include <stdlib.h>

using namespace std;

#define p10(v) __builtin_powi(10, v)

// try not to create cons-strings shorter than this
#define SHORT_CONCAT_STRING 50

// bigger value - less memory, but slower
// 16/20 keeps s.length and s.charCodeAt(i) at about 200 cycles (for actual unicode strings),
// which is similar to amortized allocation time
#define SKIP_INCR 16 // needs to be power of 2; needs to be kept in sync with compiler
#define MIN_SKIP 20  // min. size of string to use skip list; static code has its own limit

namespace pxt {

PXT_DEF_STRING(emptyString, "")

static HandlerBinding *handlerBindings;

HandlerBinding *findBinding(int source, int value) {
    for (auto p = handlerBindings; p; p = p->next) {
        if (p->source == source && p->value == value) {
            return p;
        }
    }
    return 0;
}

void setBinding(int source, int value, Action act) {
    auto curr = findBinding(source, value);
    incr(act);
    if (curr) {
        decr(curr->action);
        curr->action = act;
        return;
    }
    curr = new HandlerBinding();
    curr->next = handlerBindings;
    curr->source = source;
    curr->value = value;
    curr->action = act;
    registerGC(&curr->action);
    handlerBindings = curr;
}

static const char emptyBuffer[] __attribute__((aligned(4))) = "@PXT#:\x00\x00\x00";

#if PXT_UTF8
int utf8Len(const char *data, int size) {
    int len = 0;
    for (int i = 0; i < size; ++i) {
        char c = data[i];
        len++;
        if ((c & 0x80) == 0x00) {
            // skip
        } else if ((c & 0xe0) == 0xc0) {
            i++;
        } else if ((c & 0xf0) == 0xe0) {
            i += 2;
        } else {
            // error; just skip
        }
    }
    return len;
}

const char *utf8Skip(const char *data, int size, int skip) {
    int len = 0;
    for (int i = 0; i <= size; ++i) {
        char c = data[i];
        len++;
        if (len > skip)
            return data + i;
        if ((c & 0x80) == 0x00) {
            // skip
        } else if ((c & 0xe0) == 0xc0) {
            i++;
        } else if ((c & 0xf0) == 0xe0) {
            i += 2;
        } else {
            // error; just skip over
        }
    }
    return NULL;
}

static char *write3byte(char *dst, uint32_t charCode) {
    if (dst) {
        *dst++ = 0xe0 | (charCode >> 12);
        *dst++ = 0x80 | (0x3f & (charCode >> 6));
        *dst++ = 0x80 | (0x3f & (charCode >> 0));
    }
    return dst;
}

static char *write2byte(char *dst, uint32_t charCode) {
    if (dst) {
        *dst++ = 0xc0 | (charCode >> 6);
        *dst++ = 0x80 | (0x3f & charCode);
    }
    return dst;
}

static int utf8canon(char *dst, const char *data, int size) {
    int outsz = 0;
    for (int i = 0; i < size;) {
        uint8_t c = data[i];
        uint32_t charCode = c;
        if ((c & 0x80) == 0x00) {
            charCode = c;
            i++;
        } else if ((c & 0xe0) == 0xc0 && i + 1 < size && (data[i + 1] & 0xc0) == 0x80) {
            charCode = ((c & 0x1f) << 6) | (data[i + 1] & 0x3f);
            if (charCode < 0x80)
                goto error;
            else
                i += 2;
        } else if ((c & 0xf0) == 0xe0 && i + 2 < size && (data[i + 1] & 0xc0) == 0x80 &&
                   (data[i + 2] & 0xc0) == 0x80) {
            charCode = ((c & 0x0f) << 12) | (data[i + 1] & 0x3f) << 6 | (data[i + 2] & 0x3f);
            // don't exclude surrogate pairs, since we're generating them
            if (charCode < 0x800 /*|| (0xd800 <= charCode && charCode <= 0xdfff)*/)
                goto error;
            else
                i += 3;
        } else if ((c & 0xf8) == 0xf0 && i + 3 < size && (data[i + 1] & 0xc0) == 0x80 &&
                   (data[i + 2] & 0xc0) == 0x80 && (data[i + 3] & 0xc0) == 0x80) {
            charCode = ((c & 0x07) << 18) | (data[i + 1] & 0x3f) << 12 | (data[i + 2] & 0x3f) << 6 |
                       (data[i + 3] & 0x3f);
            if (charCode < 0x10000 || charCode > 0x10ffff)
                goto error;
            else
                i += 4;
        } else {
            goto error;
        }

        if (charCode < 0x80) {
            outsz += 1;
            if (dst)
                *dst++ = charCode;
        } else if (charCode < 0x800) {
            outsz += 2;
            dst = write2byte(dst, charCode);
        } else if (charCode < 0x10000) {
            outsz += 3;
            dst = write3byte(dst, charCode);
        } else {
            outsz += 6; // a surrogate pair
            charCode -= 0x10000;
            dst = write3byte(dst, 0xd800 + (charCode >> 10));
            dst = write3byte(dst, 0xdc00 + (charCode & 0x3ff));
        }

        continue;

    error:
        i++;
        outsz += 2;
        dst = write2byte(dst, c);
    }
    return outsz;
}

static int utf8CharCode(const char *data) {
    unsigned char c = *data;
    if ((c & 0x80) == 0) {
        return c;
    } else if ((c & 0xe0) == 0xc0) {
        return ((c & 0x1f) << 6) | (data[1] & 0x3f);
    } else if ((c & 0xf0) == 0xe0) {
        return ((c & 0x0f) << 12) | (data[1] & 0x3f) << 6 | (data[2] & 0x3f);
    } else {
        return c; // error
    }
}

static bool isUTF8(const char *data, int len) {
    for (int i = 0; i < len; ++i) {
        if (data[i] & 0x80)
            return true;
    }
    return false;
}

#define NUM_SKIP_ENTRIES(p) ((p)->skip.length / SKIP_INCR)
#define SKIP_DATA(p) (const char *)(p->skip.list + NUM_SKIP_ENTRIES(p))

static void setupSkipList(String r, const char *data) {
    char *dst = (char *)SKIP_DATA(r);
    auto len = r->skip.size;
    if (data)
        memcpy(dst, data, len);
    dst[len] = 0;
    const char *ptr = dst;
    auto skipEntries = NUM_SKIP_ENTRIES(r);
    for (int i = 0; i < skipEntries; ++i) {
        ptr = utf8Skip(ptr, len - (ptr - dst), SKIP_INCR);
        if (!ptr)
            oops(80);
        r->skip.list[i] = ptr - dst;
    }
}
#endif

String mkStringCore(const char *data, int len) {
    if (len < 0)
        len = strlen(data);
    if (len == 0)
        return (String)emptyString;

    auto vt = &string_inline_ascii_vt;
    String r;

#if PXT_UTF8
    if (data && isUTF8(data, len)) {
        vt = len >= MIN_SKIP ? &string_skiplist16_vt : &string_inline_utf8_vt;
    }
    if (vt == &string_skiplist16_vt) {
        r = new (gcAllocate(4 + 2 * 4)) BoxedString(vt);
        r->skip.size = len;
        r->skip.length = utf8Len(data, len);
        r->skip.list = (uint16_t *)gcAllocateArray(NUM_SKIP_ENTRIES(r) * 2 + len + 1);
        setupSkipList(r, data);
    } else
#endif
    {
        // for ASCII and UTF8 the layout is the same
        r = new (gcAllocate(4 + 2 + len + 1)) BoxedString(vt);
        r->ascii.length = len;
        if (data)
            memcpy(r->ascii.data, data, len);
        r->ascii.data[len] = 0;
    }

    MEMDBG("mkString: len=%d => %p", len, r);
    return r;
}

String mkString(const char *data, int len) {
#if PXT_UTF8
    if (len < 0)
        len = strlen(data);
    if (len == 0)
        return (String)emptyString;

    int sz = utf8canon(NULL, data, len);
    if (sz == len)
        return mkStringCore(data, len);
    // this could be optimized, but it only kicks in when the string isn't valid utf8
    // (or we need to introduce surrogate pairs) which is unlikely to be performance critical
    char *tmp = (char *)app_alloc(sz);
    utf8canon(tmp, data, len);
    auto r = mkStringCore(tmp, sz);
    app_free(tmp);
    return r;
#else
    return mkStringCore(data, len);
#endif
}

#ifdef PXT_UTF8
uint32_t toRealUTF8(String str, uint8_t *dst) {
    auto src = str->getUTF8Data();
    auto len = str->getUTF8Size();
    auto dlen = 0;

    for (unsigned i = 0; i < len; ++i) {
        if ((uint8_t)src[i] == 0xED && i + 5 < len) {
            auto c0 = utf8CharCode(src + i);
            auto c1 = utf8CharCode(src + i + 3);
            if (0xd800 <= c0 && c0 < 0xdc00 && 0xdc00 <= c1 && c1 < 0xe000) {
                i += 5;
                auto charCode = ((c0 - 0xd800) << 10) + (c1 - 0xdc00) + 0x10000;
                if (dst) {
                    dst[dlen] = 0xf0 | (charCode >> 18);
                    dst[dlen + 1] = 0x80 | (0x3f & (charCode >> 12));
                    dst[dlen + 2] = 0x80 | (0x3f & (charCode >> 6));
                    dst[dlen + 3] = 0x80 | (0x3f & (charCode >> 0));
                }
                dlen += 4;
            }
        } else {
            if (dst)
                dst[dlen] = src[i];
            dlen++;
        }
    }
    return dlen;
}
#endif

Buffer mkBuffer(const uint8_t *data, int len) {
    if (len <= 0)
        return (Buffer)emptyBuffer;
    Buffer r = new (gcAllocate(sizeof(BoxedBuffer) + len)) BoxedBuffer();
    r->length = len;
    if (data)
        memcpy(r->data, data, len);
    else
        memset(r->data, 0, len);
    MEMDBG("mkBuffer: len=%d => %p", len, r);
    return r;
}

static unsigned random_value = 0xC0DA1;

void seedRandom(unsigned seed) {
    random_value = seed;
}

unsigned getRandom(unsigned max) {
    unsigned m, result;

    do {
        m = (unsigned)max;
        result = 0;

        do {
            // Cycle the LFSR (Linear Feedback Shift Register).
            // We use an optimal sequence with a period of 2^32-1, as defined by Bruce Schneier here
            // (a true legend in the field!),
            // For those interested, it's documented in his paper:
            // "Pseudo-Random Sequence Generator for 32-Bit CPUs: A fast, machine-independent
            // generator for 32-bit Microprocessors"
            // https://www.schneier.com/paper-pseudorandom-sequence.html
            unsigned r = random_value;

            r = ((((r >> 31) ^ (r >> 6) ^ (r >> 4) ^ (r >> 2) ^ (r >> 1) ^ r) & 1) << 31) |
                (r >> 1);

            random_value = r;

            result = ((result << 1) | (r & 0x00000001));
        } while (m >>= 1);
    } while (result > (unsigned)max);

    return result;
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
} // namespace pxt

#ifndef X86_64

namespace String_ {

//%
String mkEmpty() {
    return (String)emptyString;
}

// TODO support var-args somehow?

//%
String fromCharCode(int code) {
#if PXT_UTF8
    char buf[3];
    int len;
    code &= 0xffff; // JS semantics
    if (code < 0x80) {
        buf[0] = code;
        len = 1;
    } else if (code < 0x800) {
        buf[0] = 0xc0 | (code >> 6);
        buf[1] = 0x80 | ((code >> 0) & 0x3f);
        len = 2;
    } else {
        buf[0] = 0xe0 | (code >> 12);
        buf[1] = 0x80 | ((code >> 6) & 0x3f);
        buf[2] = 0x80 | ((code >> 0) & 0x3f);
        len = 3;
    }
    return mkStringCore(buf, len);
#else
    char buf[] = {(char)code, 0};
    return mkStringCore(buf, 1);
#endif
}

//%
TNumber charCodeAt(String s, int pos) {
#if PXT_UTF8
    auto ptr = s->getUTF8DataAt(pos);
    if (!ptr)
        return TAG_NAN;
    auto code = utf8CharCode(ptr);
    if (!code && ptr == s->getUTF8Data() + s->getUTF8Size())
        return TAG_NAN;
    return fromInt(code);
#else
    if (s && 0 <= pos && pos < s->ascii.length) {
        return fromInt(s->ascii.data[pos]);
    } else {
        return TAG_NAN;
    }
#endif
}

//%
String charAt(String s, int pos) {
    auto v = charCodeAt(s, pos);
    if (v == TAG_NAN)
        return mkEmpty();
    if (!isNumber(v))
        oops(81);
    return fromCharCode(numValue(v));
}

#define IS_CONS(s) ((s)->vtable == (uint32_t)&string_cons_vt)
#define IS_EMPTY(s) ((s) == (String)emptyString)

//%
String concat(String s, String other) {
    if (!s)
        s = (String)sNull;
    if (!other)
        other = (String)sNull;
    if (IS_EMPTY(s))
        return (String)incrRC(other);
    if (IS_EMPTY(other))
        return (String)incrRC(s);

    uint32_t lenA, lenB;

#if PXT_UTF8
    if (IS_CONS(s)) {
        // (s->cons.left + s->cons.right) + other = s->cons.left + (s->cons.right + other)
        if (IS_CONS(other) || IS_CONS(s->cons.right))
            goto mkCons;
        auto lenAR = s->cons.right->getUTF8Size();
        lenB = other->getUTF8Size();
        if (lenAR + lenB > SHORT_CONCAT_STRING)
            goto mkCons;
        // if (s->cons.right + other) is short enough, use associativity
        // to construct a shallower tree; this should keep the live set reasonable
        // when someone decides to construct a long string by concatenating
        // single characters

        // allocate [r] first, and keep it alive
        String r = new (gcAllocate(4 + 2 * 4)) BoxedString(&string_cons_vt);
        registerGCPtr((TValue)r);
        r->cons.left = s->cons.left;
        // this concat() might trigger GC
        r->cons.right = concat(s->cons.right, other);
        unregisterGCPtr((TValue)r);
        return r;
    }
#endif

    lenA = s->getUTF8Size();
    lenB = other->getUTF8Size();
#if PXT_UTF8
    if (lenA + lenB > SHORT_CONCAT_STRING)
        goto mkCons;
#endif
    String r;
    {
        auto dataA = s->getUTF8Data();
        auto dataB = other->getUTF8Data();
        r = mkStringCore(NULL, lenA + lenB);
        auto dst = (char *)r->getUTF8Data();
        memcpy(dst, dataA, lenA);
        memcpy(dst + lenA, dataB, lenB);
#if PXT_UTF8
        if (isUTF8(dst, lenA + lenB))
            r->vtable = PXT_VTABLE_TO_INT(&string_inline_utf8_vt);
#endif
        return r;
    }

#if PXT_UTF8
mkCons:
    r = new (gcAllocate(4 + 2 * 4)) BoxedString(&string_cons_vt);
    r->cons.left = s;
    r->cons.right = other;
    return r;
#endif
}

int compare(String a, String b) {
    if (a == b)
        return 0;

    auto lenA = a->getUTF8Size();
    auto lenB = b->getUTF8Size();
    auto dataA = a->getUTF8Data();
    auto dataB = b->getUTF8Data();
    auto len = lenA < lenB ? lenA : lenB;

    // this also works for UTF8, provided canonical encoding
    // which is guaranteed by the constructor
    for (unsigned i = 0; i <= len; ++i) {
        unsigned char cA = dataA[i];
        unsigned char cB = dataB[i];
        if (cA == cB)
            continue;
        return cA < cB ? -1 : 1;
    }
    return 0;
}

//%
int length(String s) {
    return s->getLength();
}

#define isspace(c) ((c) == ' ')

NUMBER mystrtod(const char *p, char **endp) {
    while (isspace(*p))
        p++;
    NUMBER m = 1;
    NUMBER v = 0;
    int dot = 0;
    if (*p == '+')
        p++;
    if (*p == '-') {
        m = -1;
        p++;
    }
    if (*p == '0' && (p[1] | 0x20) == 'x') {
        return m * strtol(p, endp, 16);
    }
    while (*p) {
        int c = *p - '0';
        if (0 <= c && c <= 9) {
            v *= 10;
            v += c;
            if (dot)
                m /= 10;
        } else if (!dot && *p == '.') {
            dot = 1;
        } else if (*p == 'e' || *p == 'E') {
            break;
        } else {
            while (isspace(*p))
                p++;
            if (*p)
                return NAN;
            break;
        }
        p++;
    }

    v *= m;

    if (*p) {
        p++;
        int pw = strtol(p, endp, 10);
        v *= p10(pw);
    } else {
        *endp = (char *)p;
    }

    return v;
}

//%
TNumber toNumber(String s) {
    // JSCHECK
    char *endptr;
    auto data = s->getUTF8Data();
    NUMBER v = mystrtod(data, &endptr);
    if (endptr != data + s->getUTF8Size())
        v = NAN;
    else if (v == 0.0 || v == -0.0)
        v = v;
    else if (!isnormal(v))
        v = NAN;
    return fromDouble(v);
}

//%
String substr(String s, int start, int length) {
    if (length <= 0)
        return mkEmpty();
    auto slen = (int)s->getLength();
    if (start < 0)
        start = max(slen + start, 0);
    length = min(length, slen - start);
    if (length <= 0)
        return mkEmpty();
    auto p = s->getUTF8DataAt(start);
#if PXT_UTF8
    auto ep = s->getUTF8DataAt(start + length);
    if (ep == NULL)
        oops(82);
    return mkStringCore(p, ep - p);
#else
    return mkStringCore(p, length);
#endif
}

//%
int indexOf(String s, String searchString, int start) {
    if (!s || !searchString)
        return -1;
    auto lenA = s->getUTF8Size();
    auto lenB = searchString->getUTF8Size();
    if (start < 0 || start + lenB > lenA)
        return -1;
    auto dataA = s->getUTF8Data();
    auto dataB = searchString->getUTF8Data();
    auto dataA0 = dataA;
    auto firstB = dataB[0];
    while (lenA >= lenB) {
        if (*dataA == firstB && !memcmp(dataA, dataB, lenB))
#if PXT_UTF8
            return utf8Len(dataA0, dataA - dataA0);
#else
            return dataA - dataA0;
#endif
        dataA++;
        lenA--;
    }
    return -1;
}

//%
int includes(String s, String searchString, int start) {
    return -1 != indexOf(s, searchString, start);
}

} // namespace String_

namespace Boolean_ {
//%
bool bang(int v) {
    return v == 0;
}
} // namespace Boolean_

namespace pxt {

// ES5 9.5, 9.6
unsigned toUInt(TNumber v) {
    if (isNumber(v))
        return numValue(v);
    if (isSpecial(v)) {
        if ((intptr_t)v >> 6)
            return 1;
        else
            return 0;
    }
    if (!v)
        return 0;

    NUMBER num = toDouble(v);
    if (!isnormal(num))
        return 0;
#ifdef PXT_USE_FLOAT
    float rem = fmodf(truncf(num), 4294967296.0);
#else
    double rem = fmod(trunc(num), 4294967296.0);
#endif
    if (rem < 0.0)
        rem += 4294967296.0;
    return (unsigned)rem;
}
int toInt(TNumber v) {
    return (int)toUInt(v);
}

NUMBER toDouble(TNumber v) {
    if (v == TAG_NAN || v == TAG_UNDEFINED)
        return NAN;
    if (isTagged(v))
        return toInt(v);

    ValType t = valType(v);
    if (t == ValType::Number) {
        BoxedNumber *p = (BoxedNumber *)v;
        return p->num;
    } else if (t == ValType::String) {
        // TODO avoid allocation
        auto tmp = String_::toNumber((String)v);
        auto r = toDouble(tmp);
        decr(tmp);
        return r;
    } else {
        return NAN;
    }
}

float toFloat(TNumber v) {
    // TODO optimize?
    return (float)toDouble(v);
}

#if !defined(PXT_HARD_FLOAT) && !defined(PXT_USE_FLOAT)
union NumberConv {
    double v;
    struct {
        uint32_t word0;
        uint32_t word1;
    };
};

static inline TValue doubleToInt(double x) {
    NumberConv cnv;
    cnv.v = x;

    if (cnv.word1 == 0 && cnv.word0 == 0)
        return TAG_NUMBER(0);

    auto ex = (int)((cnv.word1 << 1) >> 21) - 1023;

    // DMESG("v=%d/1000 %p %p %d", (int)(x * 1000), cnv.word0, cnv.word1, ex);

    if (ex < 0 || ex > 29) {
        // the 'MININT' case
        if (ex == 30 && cnv.word0 == 0 && cnv.word1 == 0xC1D00000)
            return (TValue)(0x80000001);
        return NULL;
    }

    int32_t r;

    if (ex <= 20) {
        if (cnv.word0)
            return TAG_UNDEFINED;
        if (cnv.word1 << (ex + 12))
            return TAG_UNDEFINED;
        r = ((cnv.word1 << 11) | 0x80000000) >> (20 - ex + 11);
    } else {
        if (cnv.word0 << (ex - 20))
            return TAG_UNDEFINED;
        r = ((cnv.word1 << 11) | 0x80000000) >> (20 - ex + 11);
        r |= cnv.word0 >> (32 - (ex - 20));
    }

    if (cnv.word1 >> 31)
        return TAG_NUMBER(-r);
    else
        return TAG_NUMBER(r);
}
#else
static inline TValue doubleToInt(NUMBER r) {
    int ri = ((int)r) << 1;
    if ((ri >> 1) == r)
        return (TNumber)(ri | 1);
    return TAG_UNDEFINED;
}
#endif

TNumber fromDouble(NUMBER r) {
#ifndef PXT_BOX_DEBUG
    auto i = doubleToInt(r);
    if (i)
        return i;
#endif
    if (isnan(r))
        return TAG_NAN;
    BoxedNumber *p = NEW_GC(BoxedNumber);
    p->num = r;
    MEMDBG("mkNum: %d/1000 => %p", (int)(r * 1000), p);
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

TNumber fromUInt(unsigned v) {
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

static inline bool eq_core(TValue a, TValue b, ValType ta) {
#ifndef PXT_BOX_DEBUG
    int aa = (int)a;
    int bb = (int)b;

    // if at least one of the values is tagged, they are not equal
    if ((aa | bb) & 3)
        return false;
#endif

    if (ta == ValType::String)
        return String_::compare((String)a, (String)b) == 0;
    else if (ta == ValType::Number)
        return toDouble(a) == toDouble(b);
    else
        return a == b;
}

bool eqq_bool(TValue a, TValue b) {
    if (a == TAG_NAN || b == TAG_NAN)
        return false;

    if (a == b)
        return true;

    if (bothNumbers(a, b))
        return false;

    ValType ta = valType(a);
    ValType tb = valType(b);

    if (ta != tb)
        return false;

    return eq_core(a, b, ta);
}

bool eq_bool(TValue a, TValue b) {
    if (a == TAG_NAN || b == TAG_NAN)
        return false;

    if (eqFixup(a) == eqFixup(b))
        return true;

    if (bothNumbers(a, b))
        return false;

    ValType ta = valType(a);
    ValType tb = valType(b);

    if ((ta == ValType::String && tb == ValType::Number) ||
        (tb == ValType::String && ta == ValType::Number))
        return toDouble(a) == toDouble(b);

    if (ta == ValType::Boolean) {
        a = eqFixup(a);
        ta = ValType::Number;
    }
    if (tb == ValType::Boolean) {
        b = eqFixup(b);
        tb = ValType::Number;
    }

    if (ta != tb)
        return false;

    return eq_core(a, b, ta);
}

// TODO move to assembly
//%
bool switch_eq(TValue a, TValue b) {
    if (eq_bool(a, b)) {
        decr(b);
        return true;
    }
    return false;
}

} // namespace pxt

#define NUMOP(op) return fromDouble(toDouble(a) op toDouble(b));
#define BITOP(op) return fromInt(toInt(a) op toInt(b));
namespace numops {

int toBool(TValue v) {
    if (isTagged(v)) {
        if (v == TAG_FALSE || v == TAG_UNDEFINED || v == TAG_NAN || v == TAG_NULL ||
            v == TAG_NUMBER(0))
            return 0;
        else
            return 1;
    }

    ValType t = valType(v);
    if (t == ValType::String) {
        String s = (String)v;
        if (IS_EMPTY(s))
            return 0;
    } else if (t == ValType::Number) {
        auto x = toDouble(v);
        if (isnan(x) || x == 0.0 || x == -0.0)
            return 0;
        else
            return 1;
    }

    return 1;
}

int toBoolDecr(TValue v) {
    if (v == TAG_TRUE)
        return 1;
    if (v == TAG_FALSE)
        return 0;
    int r = toBool(v);
    decr(v);
    return r;
}

// TODO
// The integer, non-overflow case for add/sub/bit opts is handled in assembly

//%
TNumber adds(TNumber a, TNumber b){NUMOP(+)}

//%
TNumber subs(TNumber a, TNumber b){NUMOP(-)}

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
TNumber div(TNumber a, TNumber b){NUMOP(/)}

//%
TNumber mod(TNumber a, TNumber b) {
    if (isNumber(a) && isNumber(b) && numValue(b))
        BITOP(%)
    return fromDouble(fmod(toDouble(a), toDouble(b)));
}

//%
TNumber lsls(TNumber a, TNumber b){BITOP(<<)}

//%
TNumber lsrs(TNumber a, TNumber b) {
    return fromUInt(toUInt(a) >> toUInt(b));
}

//%
TNumber asrs(TNumber a, TNumber b){BITOP(>>)}

//%
TNumber eors(TNumber a, TNumber b){BITOP (^)}

//%
TNumber orrs(TNumber a, TNumber b){BITOP(|)}

//%
TNumber bnot(TNumber a) {
    return fromInt(~toInt(a));
}

//%
TNumber ands(TNumber a, TNumber b) {
    BITOP(&)
}

#define CMPOP_RAW(op, t, f)                                                                        \
    if (bothNumbers(a, b))                                                                         \
        return (int)a op((int)b) ? t : f;                                                          \
    int cmp = valCompare(a, b);                                                                    \
    return cmp != -2 && cmp op 0 ? t : f;

#define CMPOP(op) CMPOP_RAW(op, TAG_TRUE, TAG_FALSE)

// 7.2.13 Abstract Relational Comparison
static int valCompare(TValue a, TValue b) {
    if (a == TAG_NAN || b == TAG_NAN)
        return -2;

    ValType ta = valType(a);
    ValType tb = valType(b);

    if (ta == ValType::String && tb == ValType::String)
        return String_::compare((String)a, (String)b);

    if (a == b)
        return 0;

    auto da = toDouble(a);
    auto db = toDouble(b);

    if (isnan(da) || isnan(db))
        return -2;

    if (da < db)
        return -1;
    else if (da > db)
        return 1;
    else
        return 0;
}

//%
bool lt_bool(TNumber a, TNumber b){CMPOP_RAW(<, true, false)}

//%
TNumber le(TNumber a, TNumber b){CMPOP(<=)}

//%
TNumber lt(TNumber a, TNumber b){CMPOP(<)}

//%
TNumber ge(TNumber a, TNumber b){CMPOP(>=)}

//%
TNumber gt(TNumber a, TNumber b){CMPOP(>)}

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

void mycvt(NUMBER d, char *buf) {
    if (d < 0) {
        *buf++ = '-';
        d = -d;
    }

    if (!d) {
        *buf++ = '0';
        *buf++ = 0;
        return;
    }

    int pw = (int)log10(d);
    int e = 1;
    int beforeDot = 1;

    if (0.000001 <= d && d < 1e21) {
        if (pw > 0) {
            d /= p10(pw);
            beforeDot = 1 + pw;
        }
    } else {
        d /= p10(pw);
        e = pw;
    }

    int sig = 0;
    while (sig < 17 || beforeDot > 0) {
        // printf("%f sig=%d bd=%d\n", d, sig, beforeDot);
        int c = (int)d;
        *buf++ = '0' + c;
        d = (d - c) * 10;
        if (--beforeDot == 0)
            *buf++ = '.';
        if (sig || c)
            sig++;
    }

    buf--;
    while (*buf == '0')
        buf--;
    if (*buf == '.')
        buf--;
    buf++;

    if (e != 1) {
        *buf++ = 'e';
        itoa(e, buf);
    } else {
        *buf = 0;
    }
}

#if 0
//%
TValue floatAsInt(TValue x) {
    return doubleToInt(toDouble(x));
}

//% shim=numops::floatAsInt
function floatAsInt(v: number): number { return 0 }

function testInt(i: number) {
    if (floatAsInt(i) != i)
        control.panic(101)
    if (floatAsInt(i + 0.5) != null)
        control.panic(102)
    if (floatAsInt(i + 0.00001) != null)
        control.panic(103)
}

function testFloat(i: number) {
    if (floatAsInt(i) != null)
        control.panic(104)
}

function testFloatAsInt() {
    for (let i = 0; i < 0xffff; ++i) {
        testInt(i)
        testInt(-i)
        testInt(i * 10000)
        testInt(i << 12)
        testInt(i + 0x3fff0001)
        testInt(-i - 0x3fff0002)
        testFloat(i + 0x3fffffff + 1)
        testFloat((i + 10000) * 1000000)
    }   
}
#endif

String toString(TValue v) {
    ValType t = valType(v);

    if (t == ValType::String) {
        return (String)(void *)incr(v);
    } else if (t == ValType::Number) {
        char buf[64];

        if (isNumber(v)) {
            itoa(numValue(v), buf);
            return mkStringCore(buf);
        }

        if (v == TAG_NAN)
            return (String)(void *)sNaN;

        auto x = toDouble(v);

#ifdef PXT_BOX_DEBUG
        if (x == (int)x) {
            itoa((int)x, buf);
            return mkStringCore(buf);
        }
#endif

        if (isinf(x)) {
            if (x < 0)
                return (String)(void *)sMInf;
            else
                return (String)(void *)sInf;
        } else if (isnan(x)) {
            return (String)(void *)sNaN;
        }
        mycvt(x, buf);

        return mkStringCore(buf);
    } else if (t == ValType::Function) {
        return (String)(void *)sFunction;
    } else {
        if (v == TAG_UNDEFINED)
            return (String)(void *)sUndefined;
        else if (v == TAG_FALSE)
            return (String)(void *)sFalse;
        else if (v == TAG_NAN)
            return (String)(void *)sNaN;
        else if (v == TAG_TRUE)
            return (String)(void *)sTrue;
        else if (v == TAG_NULL)
            return (String)(void *)sNull;
        return (String)(void *)sObject;
    }
}

} // namespace numops

namespace Math_ {
//%
TNumber pow(TNumber x, TNumber y) {
#ifdef PXT_POWI
    // regular pow() from math.h is 4k of code
    return fromDouble(__builtin_powi(toDouble(x), toInt(y)));
#else
    return fromDouble(::pow(toDouble(x), toDouble(y)));
#endif
}

//%
TNumber atan2(TNumber y, TNumber x) {
    return fromDouble(::atan2(toDouble(y), toDouble(x)));
}

NUMBER randomDouble() {
    return getRandom(UINT_MAX) / ((NUMBER)UINT_MAX + 1) +
           getRandom(0xffffff) / ((NUMBER)UINT_MAX * 0xffffff);
}

//%
TNumber random() {
    return fromDouble(randomDouble());
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
            return fromInt(mini + getRandom(maxi - mini));
    } else {
        auto mind = toDouble(min);
        auto maxd = toDouble(max);
        if (mind > maxd) {
            auto temp = mind;
            mind = maxd;
            maxd = temp;
        }
        if (maxd == mind)
            return fromDouble(mind);
        else {
            return fromDouble(mind + randomDouble() * (maxd - mind));
        }
    }
}

#define SINGLE(op) return fromDouble(::op(toDouble(x)));

//%
TNumber log(TNumber x){SINGLE(log)}

//%
TNumber log10(TNumber x){SINGLE(log10)}

//%
TNumber tan(TNumber x){SINGLE(tan)}

//%
TNumber sin(TNumber x){SINGLE(sin)}

//%
TNumber cos(TNumber x){SINGLE(cos)}

//%
TNumber atan(TNumber x){SINGLE(atan)}

//%
TNumber asin(TNumber x){SINGLE(asin)}

//%
TNumber acos(TNumber x){SINGLE(acos)}

//%
TNumber sqrt(TNumber x){SINGLE(sqrt)}

//%
TNumber floor(TNumber x){SINGLE(floor)}

//%
TNumber ceil(TNumber x){SINGLE(ceil)}

//%
TNumber trunc(TNumber x){SINGLE(trunc)}

//%
TNumber round(TNumber x) {
    // In C++, round(-1.5) == -2, while in JS, round(-1.5) == -1. Align to the JS convention for
    // consistency between simulator and device. The following does rounding with ties (x.5) going
    // towards positive infinity.
    return fromDouble(::floor(toDouble(x) + 0.5));
}

//%
int imul(int x, int y) {
    return x * y;
}

//%
int idiv(int x, int y) {
    return x / y;
}
} // namespace Math_

namespace Array_ {
RefCollection *mk() {
    auto r = NEW_GC(RefCollection);
    MEMDBG("mkColl: => %p", r);
    return r;
}
int length(RefCollection *c) {
    return c->length();
}
void setLength(RefCollection *c, int newLength) {
    c->setLength(newLength);
}
void push(RefCollection *c, TValue x) {
    c->head.push(x);
}
TValue pop(RefCollection *c) {
    return c->head.pop();
}
TValue getAt(RefCollection *c, int x) {
    return c->head.get(x);
}
void setAt(RefCollection *c, int x, TValue y) {
    c->head.set(x, y);
}
TValue removeAt(RefCollection *c, int x) {
    return c->head.remove(x);
}
void insertAt(RefCollection *c, int x, TValue value) {
    c->head.insert(x, value);
}
int indexOf(RefCollection *c, TValue x, int start) {
    auto data = c->head.getData();
    auto len = c->head.getLength();
    for (unsigned i = 0; i < len; i++) {
        if (pxt::eq_bool(data[i], x)) {
            return (int)i;
        }
    }
    return -1;
}
bool removeElement(RefCollection *c, TValue x) {
    int idx = indexOf(c, x, 0);
    if (idx >= 0) {
        decr(removeAt(c, idx));
        return 1;
    }
    return 0;
}
} // namespace Array_

namespace pxt {
//%
void *ptrOfLiteral(int offset);

//%
unsigned programSize() {
    return bytecode[17] * 8;
}

//%
int getConfig(int key, int defl) {
    int *cfgData;

#ifdef PXT_BOOTLOADER_CFG_ADDR
    cfgData = *(int **)(PXT_BOOTLOADER_CFG_ADDR);
#ifdef PXT_BOOTLOADER_CFG_MAGIC
    cfgData++;
    if ((void *)0x200 <= cfgData && cfgData < (void *)PXT_BOOTLOADER_CFG_ADDR &&
        cfgData[-1] == (int)PXT_BOOTLOADER_CFG_MAGIC)
#endif
        for (int i = 0;; i += 2) {
            if (cfgData[i] == key)
                return cfgData[i + 1];
            if (cfgData[i] == 0)
                break;
        }
#endif

    cfgData = *(int **)&bytecode[18];
    for (int i = 0;; i += 2) {
        if (cfgData[i] == key)
            return cfgData[i + 1];
        if (cfgData[i] == 0)
            return defl;
    }
}

} // namespace pxt

namespace pxtrt {
//%
TValue ldlocRef(RefRefLocal *r) {
    TValue tmp = r->v;
    incr(tmp);
    return tmp;
}

//%
void stlocRef(RefRefLocal *r, TValue v) {
    decr(r->v);
    r->v = v;
}

//%
RefRefLocal *mklocRef() {
    auto r = NEW_GC(RefRefLocal);
    MEMDBG("mklocRef: => %p", r);
    return r;
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
String emptyToNull(String s) {
    if (!s || IS_EMPTY(s))
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
    auto r = NEW_GC(RefMap);
    MEMDBG("mkMap: => %p", r);
    return r;
}

//%
TValue mapGetByString(RefMap *map, String key) {
    int i = map->findIdx(key);
    if (i < 0) {
        return 0;
    }
    TValue r = incr(map->values.get(i));
    return r;
}

//%
int lookupMapKey(String key) {
    auto arr = *(uintptr_t **)&bytecode[22];
    auto len = *arr++;
    auto ikey = (uintptr_t)key;
    auto l = 0U;
    auto r = len - 1;
    if (arr[0] <= ikey && ikey <= arr[len - 1]) {
        while (l <= r) {
            auto m = (l + r) >> 1;
            if (arr[m] == ikey)
                return m;
            else if (arr[m] < ikey)
                l = m + 1;
            else
                r = m - 1;
        }
    } else {
        while (l <= r) {
            auto m = (l + r) >> 1;
            auto cmp = String_::compare((String)arr[m], key);
            if (cmp == 0)
                return m;
            else if (cmp < 0)
                l = m + 1;
            else
                r = m - 1;
        }
    }
    return 0;
}

//%
TValue mapGet(RefMap *map, unsigned key) {
    auto arr = *(String **)&bytecode[22];
    auto r = mapGetByString(map, arr[key + 1]);
    map->unref();
    return r;
}

//%
void mapSetByString(RefMap *map, String key, TValue val) {
    int i = map->findIdx(key);
    if (i < 0) {
        incrRC(key);
        map->keys.push((TValue)key);
        map->values.push(val);
    } else {
        map->values.set(i, val);
    }
    incr(val);
}

//%
void mapSet(RefMap *map, unsigned key, TValue val) {
    auto arr = *(String **)&bytecode[22];
    mapSetByString(map, arr[key + 1], val);
    decr(val);
    map->unref();
}

//
// Debugger
//

// This is only to be called once at the beginning of lambda function
//%
void *getGlobalsPtr() {
#ifdef DEVICE_GROUP_ID_USER
    fiber_set_group(DEVICE_GROUP_ID_USER);
#endif

    return globals;
}

//%
void runtimeWarning(String s) {
    // noop for now
}
} // namespace pxtrt
#endif

namespace pxt {

//%
ValType valType(TValue v) {
    if (isTagged(v)) {
        if (!v)
            return ValType::Undefined;

        if (isNumber(v) || v == TAG_NAN)
            return ValType::Number;
        if (v == TAG_TRUE || v == TAG_FALSE)
            return ValType::Boolean;
        else if (v == TAG_NULL)
            return ValType::Object;
        else {
            oops(1);
            return ValType::Object;
        }
    } else {
        auto vt = getVTable((RefObject *)v);
        if (vt->magic == VTABLE_MAGIC)
            return vt->objectType;
        else
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
String typeOf(TValue v) {
    switch (valType(v)) {
    case ValType::Undefined:
        return (String)sUndefinedTp;
    case ValType::Boolean:
        return (String)sBooleanTp;
    case ValType::Number:
        return (String)sNumberTp;
    case ValType::String:
        return (String)sStringTp;
    case ValType::Object:
        return (String)sObjectTp;
    case ValType::Function:
        return (String)sFunctionTp;
    default:
        oops(2);
        return 0;
    }
}

// Maybe in future we will want separate print methods; for now ignore
void anyPrint(TValue v) {
    if (valType(v) == ValType::Object) {
        if (isRefCounted(v)) {
            auto o = (RefObject *)v;
            auto vt = getVTable(o);
            auto meth = ((RefObjectMethod)vt->methods[1]);
            if ((void *)meth == (void *)&anyPrint)
                DMESG("[RefObject refs=%d vt=%p cl=%d sz=%d]", REFCNT(o), o->vtable, vt->classNo,
                      vt->numbytes);
            else
                meth(o);
        } else {
            DMESG("[Native %p]", v);
        }
    } else {
#ifndef X86_64
        String s = numops::toString(v);
        DMESG("[%s %p = %s]", pxt::typeOf(v)->getUTF8Data(), v, s->getUTF8Data());
        decr((TValue)s);
#endif
    }
}

static void dtorDoNothing() {}

#ifdef PXT_GC
#define PRIM_VTABLE(name, objectTp, tp, szexpr)                                                    \
    static uint32_t name##_size(tp *p) { return ((sizeof(tp) + szexpr) + 3) >> 2; }                \
    DEF_VTABLE(name##_vt, tp, objectTp, (void *)&dtorDoNothing, (void *)&anyPrint, 0,              \
               (void *)&name##_size)
#else
#define PRIM_VTABLE(name, objectTp, tp, szexpr)                                                    \
    DEF_VTABLE(name##_vt, tp, objectTp, (void *)&dtorDoNothing, (void *)&anyPrint)
#endif

#define NOOP ((void)0)
#define STRING_VT(name, fix, scan, gcsize, data, utfsize, length, dataAt)                          \
    static uint32_t name##_gcsize(BoxedString *p) { return (4 + (gcsize) + 3) >> 2; }              \
    static void name##_gcscan(BoxedString *p) { scan; }                                            \
    static const char *name##_data(BoxedString *p) {                                               \
        fix;                                                                                       \
        return data;                                                                               \
    }                                                                                              \
    static uint32_t name##_utfsize(BoxedString *p) {                                               \
        fix;                                                                                       \
        return utfsize;                                                                            \
    }                                                                                              \
    static uint32_t name##_length(BoxedString *p) {                                                \
        fix;                                                                                       \
        return length;                                                                             \
    }                                                                                              \
    static const char *name##_dataAt(BoxedString *p, uint32_t idx) {                               \
        fix;                                                                                       \
        return dataAt;                                                                             \
    }                                                                                              \
    DEF_VTABLE(name##_vt, BoxedString, ValType::String, (void *)&dtorDoNothing, (void *)&anyPrint, \
               (void *)&name##_gcscan, (void *)&name##_gcsize, (void *)&name##_data,               \
               (void *)&name##_utfsize, (void *)&name##_length, (void *)&name##_dataAt)

void gcMarkArray(void *data);
void gcScan(TValue v);

#if PXT_UTF8
static const char *skipLookup(BoxedString *p, uint32_t idx) {
    if (idx > p->skip.length)
        return NULL;
    auto ent = idx / SKIP_INCR;
    auto data = SKIP_DATA(p);
    auto size = p->skip.size;
    if (ent) {
        auto off = p->skip.list[ent - 1];
        data += off;
        size -= off;
        idx &= SKIP_INCR - 1;
    }
    return utf8Skip(data, size, idx);
}

extern LLSegment workQueue;

static uint32_t fixSize(BoxedString *p, uint32_t *len) {
    uint32_t tlen = 0;
    uint32_t sz = 0;
    if (workQueue.getLength())
        oops(81);
    workQueue.push((TValue)p);
    while (workQueue.getLength()) {
        p = (BoxedString *)workQueue.pop();
        if (IS_CONS(p)) {
            workQueue.push((TValue)p->cons.right);
            workQueue.push((TValue)p->cons.left);
        } else {
            tlen += p->getLength();
            sz += p->getUTF8Size();
        }
    }
    *len = tlen;
    return sz;
}

static void fixCopy(BoxedString *p, char *dst) {
    if (workQueue.getLength())
        oops(81);

    workQueue.push((TValue)p);
    while (workQueue.getLength()) {
        p = (BoxedString *)workQueue.pop();
        if (IS_CONS(p)) {
            workQueue.push((TValue)p->cons.right);
            workQueue.push((TValue)p->cons.left);
        } else {
            auto sz = p->getUTF8Size();
            memcpy(dst, p->getUTF8Data(), sz);
            dst += sz;
        }
    }
}

// switches CONS representation into skip list representation
// does not switch representation of CONS' children
static void fixCons(BoxedString *r) {
    uint32_t length = 0;
    auto sz = fixSize(r, &length);
    auto numSkips = length / SKIP_INCR;
    // allocate first, while [r] still holds references to its children
    // because allocation might trigger GC
    auto data = (uint16_t *)gcAllocateArray(numSkips * 2 + sz + 1);
    // copy, while [r] is still cons
    fixCopy(r, (char *)(data + numSkips));
    // now, set [r] up properly
    r->vtable = PXT_VTABLE_TO_INT(&string_skiplist16_vt);
    r->skip.size = sz;
    r->skip.length = length;
    r->skip.list = data;
    setupSkipList(r, NULL);
}
#endif

STRING_VT(string_inline_ascii, NOOP, NOOP, 2 + p->ascii.length + 1, p->ascii.data, p->ascii.length,
          p->ascii.length, idx <= p->ascii.length ? p->ascii.data + idx : NULL)
#if PXT_UTF8
STRING_VT(string_inline_utf8, NOOP, NOOP, 2 + p->utf8.length + 1, p->utf8.data, p->utf8.length,
          utf8Len(p->utf8.data, p->utf8.length), utf8Skip(p->utf8.data, p->utf8.length, idx))
STRING_VT(string_skiplist16, NOOP, gcMarkArray(p->skip.list), 2 + 2 + 4, SKIP_DATA(p), p->skip.size,
          p->skip.length, skipLookup(p, idx))
STRING_VT(string_cons, fixCons(p), (gcScan((TValue)p->cons.left), gcScan((TValue)p->cons.right)),
          4 + 4, SKIP_DATA(p), p->skip.size, p->skip.length, skipLookup(p, idx))
#endif

PRIM_VTABLE(number, ValType::Number, BoxedNumber, 0)
PRIM_VTABLE(buffer, ValType::Object, BoxedBuffer, p->length)
// PRIM_VTABLE(action, ValType::Function, RefAction, )

void failedCast(TValue v) {
    DMESG("failed type check for %p", v);
    auto vt = getAnyVTable(v);
    if (vt) {
        DMESG("VT %p - objtype %d classNo %d", vt, vt->objectType, vt->classNo);
    }

    int code;
    if (v == TAG_NULL)
        code = PANIC_CAST_FROM_NULL;
    else
        code = PANIC_CAST_FIRST + (int)valType(v);
    target_panic(code);
}

void missingProperty(TValue v) {
    DMESG("missing property on %p", v);
    target_panic(PANIC_MISSING_PROPERTY);
}

#ifdef PXT_PROFILE
struct PerfCounter *perfCounters;

struct PerfCounterInfo {
    uint32_t numPerfCounters;
    char *perfCounterNames[0];
};

#define PERF_INFO ((PerfCounterInfo *)(((uintptr_t *)bytecode)[13]))

void initPerfCounters() {
    auto n = PERF_INFO->numPerfCounters;
    perfCounters = new PerfCounter[n];
    memset(perfCounters, 0, n * sizeof(PerfCounter));
}

void dumpPerfCounters() {
    auto info = PERF_INFO;
    DMESG("calls,us,name");
    for (uint32_t i = 0; i < info->numPerfCounters; ++i) {
        auto c = &perfCounters[i];
        DMESG("%d,%d,%s", c->numstops, c->value, info->perfCounterNames[i]);
    }
}

void startPerfCounter(PerfCounters n) {
    auto c = &perfCounters[(uint32_t)n];
    if (c->start)
        oops(50);
    c->start = PERF_NOW();
}

void stopPerfCounter(PerfCounters n) {
    auto c = &perfCounters[(uint32_t)n];
    if (!c->start)
        oops(51);
    c->value += PERF_NOW() - c->start;
    c->start = 0;
    c->numstops++;
}
#endif

} // namespace pxt

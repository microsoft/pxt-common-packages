#include "pxtbase.h"
#include <limits.h>
#include <stdlib.h>

using namespace std;

#define p10(v) __builtin_powi(10, v)

// try not to create cons-strings shorter than this
#define SHORT_CONCAT_STRING 50

namespace pxt {

PXT_DEF_STRING(emptyString, "")

static HandlerBinding *handlerBindings;

HandlerBinding *nextBinding(HandlerBinding *curr, int source, int value) {
    for (auto p = curr; p; p = p->next) {
        // DEVICE_ID_ANY == DEVICE_EXT_ANY == 0
        if ((p->source == source || p->source == 0) &&
            (value == -1 || p->value == value || p->value == 0)) {
            return p;
        }
    }
    return 0;
}

HandlerBinding *findBinding(int source, int value) {
    return nextBinding(handlerBindings, source, value);
}

void setBinding(int source, int value, Action act) {
    HandlerBinding *curr = NULL;
    for (auto p = handlerBindings; p; p = p->next) {
        if ((p->source == source) && (p->value == value)) {
            curr = p;
            break;
        }
    }
    if (curr) {
        curr->action = act;
        return;
    }
    curr = new (app_alloc(sizeof(HandlerBinding))) HandlerBinding();
    curr->next = handlerBindings;
    curr->source = source;
    curr->value = value;
    curr->action = act;
    registerGC(&curr->action);
    handlerBindings = curr;
}

void coreReset() {
    // these are allocated on GC heap, so they will go away together with the reset
    handlerBindings = NULL;
}

struct EmptyBufferLayout {
    const void *vtable;
    // data needs to be word-aligned, so we use 32 bits for length
    int length;
    uint8_t data[1];
};

static const EmptyBufferLayout emptyBuffer[1] = {{&pxt::buffer_vt, 0, {0}}};

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

static void setupSkipList(String r, const char *data, int packed) {
    char *dst = (char *)(packed ? PXT_SKIP_DATA_PACK(r) : PXT_SKIP_DATA_IND(r));
    auto len = r->skip.size;
    if (data)
        memcpy(dst, data, len);
    #pragma GCC diagnostic push
    #pragma GCC diagnostic ignored "-Wstringop-overflow"
    dst[len] = 0;
    #pragma GCC diagnostic pop
    const char *ptr = dst;
    auto skipEntries = PXT_NUM_SKIP_ENTRIES(r);
    auto lst = packed ? r->skip_pack.list : r->skip.list;
    for (int i = 0; i < skipEntries; ++i) {
        ptr = utf8Skip(ptr, (int)(len - (ptr - dst)), PXT_STRING_SKIP_INCR);
        if (!ptr)
            oops(80);
        lst[i] = ptr - dst;
    }
}
#endif

String mkStringCore(const char *data, int len) {
    if (len < 0)
        len = (int)strlen(data);
    if (len == 0)
        return (String)emptyString;

    auto vt = &string_inline_ascii_vt;
    String r;

#if PXT_UTF8
    if (data && isUTF8(data, len)) {
        vt = len >= PXT_STRING_MIN_SKIP ? &string_skiplist16_packed_vt : &string_inline_utf8_vt;
    }
    if (vt == &string_skiplist16_packed_vt) {
        int ulen = utf8Len(data, len);
        r = new (gcAllocate(sizeof(void *) + 2 + 2 + (ulen / PXT_STRING_SKIP_INCR) * 2 + len + 1))
            BoxedString(vt);
        r->skip_pack.size = len;
        r->skip_pack.length = ulen;
        setupSkipList(r, data, 1);
    } else
#endif
    {
        // for ASCII and UTF8 the layout is the same
        r = new (gcAllocate(sizeof(void *) + 2 + len + 1)) BoxedString(vt);
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
        len = (int)strlen(data);
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

#if PXT_UTF8
// This converts surrogate pairs, which are encoded as 2 characters of 3 bytes each
// into a proper 4 byte utf-8 character.
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

Buffer mkBuffer(const void *data, int len) {
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

//%
void seedRandom(unsigned seed) {
    random_value = seed;
}

//% expose
void seedAddRandom(unsigned seed) {
    random_value ^= 0xCA2557CB * seed;
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

TNumber BoxedString::charCodeAt(int pos) {
#if PXT_UTF8
    auto ptr = this->getUTF8DataAt(pos);
    if (!ptr)
        return TAG_NAN;
    auto code = utf8CharCode(ptr);
    if (!code && ptr == this->getUTF8Data() + this->getUTF8Size())
        return TAG_NAN;
    return fromInt(code);
#else
    if (0 <= pos && pos < this->ascii.length) {
        return fromInt(this->ascii.data[pos]);
    } else {
        return TAG_NAN;
    }
#endif
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
    if (!s)
        return TAG_NAN;
    return s->charCodeAt(pos);
}

//%
String charAt(String s, int pos) {
    auto v = charCodeAt(s, pos);
    if (v == TAG_NAN)
        return mkEmpty();
    if (!isInt(v))
        oops(81);
    return fromCharCode(numValue(v));
}

#define IS_CONS(s) ((s)->vtable == &string_cons_vt)
#define IS_EMPTY(s) ((s) == (String)emptyString)

//%
String concat(String s, String other) {
    if (!s)
        s = (String)sNull;
    if (!other)
        other = (String)sNull;
    if (IS_EMPTY(s))
        return other;
    if (IS_EMPTY(other))
        return s;

    uint32_t lenA, lenB;

#if PXT_UTF8
    if (IS_CONS(s)) {
        // (s->cons.left + s->cons.right) + other = s->cons.left + (s->cons.right + other)
        if (IS_CONS(other) || IS_CONS(s->cons.right))
            goto mkCons;
        auto lenAR = s->cons.right->getUTF8Size();
        lenB = other->getUTF8Size(); // de-consify other
        if (lenAR + lenB > SHORT_CONCAT_STRING)
            goto mkCons;
        // if (s->cons.right + other) is short enough, use associativity
        // to construct a shallower tree; this should keep the live set reasonable
        // when someone decides to construct a long string by concatenating
        // single characters

        // allocate [r] first, and keep it alive
        String r = new (gcAllocate(3 * sizeof(void *))) BoxedString(&string_cons_vt);
        registerGCObj(r);
        r->cons.left = s->cons.left;
        // this concat() might trigger GC
        r->cons.right = concat(s->cons.right, other);
        unregisterGCObj(r);
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
            r->vtable = &string_inline_utf8_vt;
#endif
        return r;
    }

#if PXT_UTF8
mkCons:
    r = new (gcAllocate(3 * sizeof(void *))) BoxedString(&string_cons_vt);
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
#define iswhitespace(c)                                                                            \
    ((c) == 0x09 || (c) == 0x0B || (c) == 0x0C || (c) == 0x20 || (uint8_t)(c) == 0xA0 ||           \
     (c) == 0x0A || (c) == 0x0D)

NUMBER mystrtod(const char *p, char **endp) {
    while (iswhitespace(*p))
        p++;
    NUMBER m = 1;
    NUMBER v = 0;
    int dot = 0;
    int hasDigit = 0;
    if (*p == '+')
        p++;
    if (*p == '-') {
        m = -1;
        p++;
    }

    while (*p) {
        int c = *p - '0';
        if (0 <= c && c <= 9) {
            v *= 10;
            v += c;
            if (dot)
                m /= 10;
            hasDigit = 1;
        } else if (!dot && *p == '.') {
            dot = 1;
        } else if (!hasDigit) {
            return NAN;
        } else {
            break;
        }
        p++;
    }

    v *= m;

    if (*p == 'e' || *p == 'E') {
        p++;
        int pw = (int)strtol(p, endp, 10);
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
    if (v == 0.0 || v == -0.0) {
        // nothing
    } else if (!isnormal(v))
        v = NAN;
    return fromDouble(v);
}

//%
String substr(String s, int start, int length) {
    if (length <= 0)
        return mkEmpty();
    auto slen = (int)s->getLength();
    if (start < 0)
        start = pxt::max(slen + start, 0);
    length = pxt::min(length, slen - start);
    if (length <= 0)
        return mkEmpty();
    auto p = s->getUTF8DataAt(start);
#if PXT_UTF8
    auto ep = s->getUTF8DataAt(start + length);
    if (ep == NULL)
        oops(82);
    return mkStringCore(p, (int)(ep - p));
#else
    return mkStringCore(p, length);
#endif
}

//%
int indexOf(String s, String searchString, int start) {
    if (!s || !searchString)
        return -1;

    if (start < 0)
        start = 0;

    auto dataA0 = s->getUTF8Data();
    auto dataA = s->getUTF8DataAt(start);
    auto offset = dataA - dataA0;
    auto lenA = s->getUTF8Size() - offset;
    auto lenB = searchString->getUTF8Size();

    if (dataA == NULL || lenB > lenA)
        return -1;

    auto dataB = searchString->getUTF8Data();
    auto firstB = dataB[0];
    while (lenA >= lenB) {
        if (*dataA == firstB && !memcmp(dataA, dataB, lenB))
#if PXT_UTF8
            return utf8Len(dataA0, (int)(dataA - dataA0));
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
bool bang(bool v) {
    return v == 0;
}
} // namespace Boolean_

namespace pxt {

// ES5 9.5, 9.6
unsigned toUInt(TNumber v) {
    if (isInt(v))
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

#ifdef PXT64
    if (isDouble(v))
        return doubleVal(v);
#endif

    ValType t = valType(v);

#ifndef PXT64
    if (t == ValType::Number) {
        BoxedNumber *p = (BoxedNumber *)v;
        return p->num;
    }
#endif

    if (t == ValType::String) {
        // TODO avoid allocation
        auto tmp = String_::toNumber((String)v);
        auto r = toDouble(tmp);
        return r;
    } else {
        return NAN;
    }
}

float toFloat(TNumber v) {
    if (v == TAG_NAN || v == TAG_UNDEFINED)
        return NAN;
    // optimize for the int case - this will avoid software conversion when FPU is present
    if (isTagged(v))
        return toInt(v);
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
#ifdef PXT64
    if ((int)r == r)
        return TAG_NUMBER((int)r);
#else
    int ri = ((int)r) << 1;
    if ((ri >> 1) == r)
        return (TNumber)(uintptr_t)(ri | 1);
#endif
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
#ifdef PXT64
    return tvalueFromDouble(r);
#else
    BoxedNumber *p = NEW_GC(BoxedNumber);
    p->num = r;
    MEMDBG("mkNum: %d/1000 => %p", (int)(r * 1000), p);
    return (TNumber)p;
#endif
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
    auto aa = (intptr_t)a;
    auto bb = (intptr_t)b;

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
    return toBool(v);
}

// The integer, non-overflow case for add/sub/bit opts is handled in assembly

#ifdef PXT_VM
#define NUMOP2(op)                                                                                 \
    if (bothNumbers(a, b)) {                                                                       \
        auto tmp = (int64_t)numValue(a) op(int64_t) numValue(b);                                   \
        if ((int)tmp == tmp)                                                                       \
            return TAG_NUMBER((int)tmp);                                                           \
    }                                                                                              \
    NUMOP(op)
#else
#define NUMOP2(op) NUMOP(op)
#endif

//%
TNumber adds(TNumber a, TNumber b){NUMOP2(+)}

//%
TNumber subs(TNumber a, TNumber b){NUMOP2(-)}

//%
TNumber muls(TNumber a, TNumber b) {
    if (bothNumbers(a, b)) {
#ifdef PXT64
        auto tmp = (int64_t)numValue(a) * (int64_t)numValue(b);
        if ((int)tmp == tmp)
            return TAG_NUMBER((int)tmp);
#else
        int aa = (int)a;
        int bb = (int)b;
        // if both operands fit 15 bits, the result will not overflow int
        if ((aa >> 15 == 0 || aa >> 15 == -1) && (bb >> 15 == 0 || bb >> 15 == -1)) {
            // it may overflow 31 bit int though - use fromInt to convert properly
            return fromInt((aa >> 1) * (bb >> 1));
        }
#endif
    }
    NUMOP(*)
}

//%
TNumber div(TNumber a, TNumber b) {
    if (b == TAG_NUMBER(1))
        return a;
    NUMOP(/)
}

//%
TNumber mod(TNumber a, TNumber b) {
    if (isInt(a) && isInt(b) && numValue(b))
        BITOP(%)
    return fromDouble(fmod(toDouble(a), toDouble(b)));
}

//%
TNumber lsls(TNumber a, TNumber b) {
    return fromInt(toInt(a) << (toInt(b) & 0x1f));
}

//%
TNumber lsrs(TNumber a, TNumber b) {
    return fromUInt(toUInt(a) >> (toUInt(b) & 0x1f));
}

//%
TNumber asrs(TNumber a, TNumber b) {
    return fromInt(toInt(a) >> (toInt(b) & 0x1f));
}

//%
TNumber eors(TNumber a, TNumber b){BITOP(^)}

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

#ifdef PXT64
#define CMPOP_RAW(op, t, f)                                                                        \
    if (bothNumbers(a, b))                                                                         \
        return numValue(a) op numValue(b) ? t : f;                                                 \
    int cmp = valCompare(a, b);                                                                    \
    return cmp != -2 && cmp op 0 ? t : f;
#else
#define CMPOP_RAW(op, t, f)                                                                        \
    if (bothNumbers(a, b))                                                                         \
        return (intptr_t)a op((intptr_t)b) ? t : f;                                                \
    int cmp = valCompare(a, b);                                                                    \
    return cmp != -2 && cmp op 0 ? t : f;
#endif

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

// How many significant digits mycvt() should output.
// This cannot be more than 15, as this is the most that can be accurately represented
// in 64 bit double. Otherwise this code may crash.
#define DIGITS 15

static const uint64_t pows[] = {
    1LL,           10LL,           100LL,           1000LL,           10000LL,
    100000LL,      1000000LL,      10000000LL,      100000000LL,      1000000000LL,
    10000000000LL, 100000000000LL, 1000000000000LL, 10000000000000LL, 100000000000000LL,
};

// The basic idea is we convert d to a 64 bit integer with DIGITS
// digits, and then print it out, putting dot in the right place.

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

    // if outside 1e-6 -- 1e21 range, we use the e-notation
    if (d < 1e-6 || d > 1e21) {
        // normalize number to 1.XYZ, save e, and reset pw
        if (pw < 0)
            d *= p10(-pw);
        else
            d /= p10(pw);
        e = pw;
        pw = 0;
    }

    int trailingZ = 0;
    int dotAfter = pw + 1; // at which position the dot should be in the number

    uint64_t dd;

    // normalize number to be integer with exactly DIGITS digits
    if (pw >= DIGITS) {
        // if the number is larger than DIGITS, we need trailing zeroes
        trailingZ = pw - DIGITS + 1;
        dd = (uint64_t)(d / p10(trailingZ) + 0.5);
    } else {
        dd = (uint64_t)(d * p10(DIGITS - pw - 1) + 0.5);
    }

    // if number is less than 1, we need 0.00...00 at the beginning
    if (dotAfter < 1) {
        *buf++ = '0';
        *buf++ = '.';
        int n = -dotAfter;
        while (n--)
            *buf++ = '0';
    }

    // now print out the actual number
    for (int i = DIGITS - 1; i >= 0; i--) {
        uint64_t q = pows[i];
        // this may be faster than fp-division and fmod(); or maybe not
        // anyways, it works
        int k = '0';
        while (dd >= q) {
            dd -= q;
            k++;
        }
        *buf++ = k;
        // if we're after dot, and what's left is zeroes, stop
        if (dd == 0 && (DIGITS - i) >= dotAfter)
            break;
        // print the dot, if we arrived at it
        if ((DIGITS - i) == dotAfter)
            *buf++ = '.';
    }

    // print out remaining trailing zeroes if any
    while (trailingZ-- > 0)
        *buf++ = '0';

    // if we used e-notation, handle that
    if (e != 1) {
        *buf++ = 'e';
        if (e > 0)
            *buf++ = '+';
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
        return (String)v;
    } else if (t == ValType::Number) {
        char buf[64];

        if (isInt(v)) {
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
    if (isInt(min) && isInt(max)) {
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
int debugFlags;

//%
void *ptrOfLiteral(int offset);

#ifdef PXT_VM
unsigned programSize() {
    return 0;
}
#else
//%
unsigned programSize() {
    return bytecode[17] * 8;
}
#endif

void deepSleep() __attribute__((weak));
//%
void deepSleep() {}

int *getBootloaderConfigData() __attribute__((weak));
int *getBootloaderConfigData() {
    return NULL;
}

//%
int getConfig(int key, int defl) {
#ifdef PXT_VM
    if (!vmImg)
        return defl;
    int *cfgData = vmImg->configData;
#else
    int *cfgData = bytecode ? *(int **)&bytecode[18] : NULL;
#endif

    if (cfgData) {
        for (int i = 0;; i += 2) {
            if (cfgData[i] == key)
                return cfgData[i + 1];
            if (cfgData[i] == 0)
                break;
        }
    }

    cfgData = getBootloaderConfigData();

    if (cfgData) {
        for (int i = 0;; i += 2) {
            if (cfgData[i] == key)
                return cfgData[i + 1];
            if (cfgData[i] == 0)
                break;
        }
    }

    return defl;
}

} // namespace pxt

namespace pxtrt {
//%
TValue ldlocRef(RefRefLocal *r) {
    return r->v;
}

//%
void stlocRef(RefRefLocal *r, TValue v) {
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
    soft_panic(code);
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

RefMap *mkMap() {
    auto r = NEW_GC(RefMap);
    MEMDBG("mkMap: => %p", r);
    return r;
}

TValue mapGetByString(RefMap *map, String key) {
    int i = map->findIdx(key);
    if (i < 0) {
        return 0;
    }
    return map->values.get(i);
}

#ifdef PXT_VM
#define IFACE_MEMBER_NAMES vmImg->ifaceMemberNames
#else
#define IFACE_MEMBER_NAMES *(uintptr_t **)&bytecode[22]
#endif

int lookupMapKey(String key) {
    auto arr = IFACE_MEMBER_NAMES;
    auto len = *arr++;
    int l = 1U; // skip index 0 - it's invalid
    int r = (int)len - 1;
    auto ikey = (uintptr_t)key;
    if (arr[l] <= ikey && ikey <= arr[r]) {
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
            int m = (l + r) >> 1;
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

TValue mapGet(RefMap *map, unsigned key) {
    auto arr = (String *)IFACE_MEMBER_NAMES;
    auto r = mapGetByString(map, arr[key + 1]);
    map->unref();
    return r;
}

void mapSetByString(RefMap *map, String key, TValue val) {
    int i = map->findIdx(key);
    if (i < 0) {
        map->keys.push((TValue)key);
        map->values.push(val);
    } else {
        map->values.set(i, val);
    }
}

void mapSet(RefMap *map, unsigned key, TValue val) {
    auto arr = (String *)IFACE_MEMBER_NAMES;
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

void doNothing() {}

//%
ValType valType(TValue v) {
    if (isTagged(v)) {
        if (!v)
            return ValType::Undefined;

        if (isInt(v) || v == TAG_NAN)
            return ValType::Number;
        if (v == TAG_TRUE || v == TAG_FALSE)
            return ValType::Boolean;
        else if (v == TAG_NULL)
            return ValType::Object;
        else {
            oops(1);
            return ValType::Object;
        }
#ifdef PXT64
    } else if (isDouble(v)) {
        return ValType::Number;
#endif
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

//% expose
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
                DMESG("[RefObject vt=%p cl=%d sz=%d]", o->vtable, vt->classNo, vt->numbytes);
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

#define PRIM_VTABLE(name, objectTp, tp, szexpr)                                                    \
    static uint32_t name##_size(tp *p) { return TOWORDS(sizeof(tp) + szexpr); }                    \
    DEF_VTABLE(name##_vt, tp, objectTp, (void *)&dtorDoNothing, (void *)&anyPrint, 0,              \
               (void *)&name##_size)

#define NOOP ((void)0)

#define STRING_VT(name, fix, scan, gcsize, data, utfsize, length, dataAt)                          \
    static uint32_t name##_gcsize(BoxedString *p) { return TOWORDS(sizeof(void *) + (gcsize)); }   \
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
static const char *skipLookup(BoxedString *p, uint32_t idx, int packed) {
    if (idx > p->skip.length)
        return NULL;
    auto ent = idx / PXT_STRING_SKIP_INCR;
    auto data = packed ? PXT_SKIP_DATA_PACK(p) : PXT_SKIP_DATA_IND(p);
    auto size = p->skip.size;
    if (ent) {
        auto off = packed ? p->skip_pack.list[ent - 1] : p->skip.list[ent - 1];
        data += off;
        size -= off;
        idx &= PXT_STRING_SKIP_INCR - 1;
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
    auto numSkips = length / PXT_STRING_SKIP_INCR;
    // allocate first, while [r] still holds references to its children
    // because allocation might trigger GC
    auto data = (uint16_t *)gcAllocateArray(numSkips * 2 + sz + 1);
    // copy, while [r] is still cons
    fixCopy(r, (char *)(data + numSkips));
    // now, set [r] up properly
    r->vtable = &string_skiplist16_vt;
    r->skip.size = sz;
    r->skip.length = length;
    r->skip.list = data;
    setupSkipList(r, NULL, 0);
}
#endif

STRING_VT(string_inline_ascii, NOOP, NOOP, 2 + p->ascii.length + 1, p->ascii.data, p->ascii.length,
          p->ascii.length, idx <= p->ascii.length ? p->ascii.data + idx : NULL)
#if PXT_UTF8
STRING_VT(string_inline_utf8, NOOP, NOOP, 2 + p->utf8.size + 1, p->utf8.data, p->utf8.size,
          utf8Len(p->utf8.data, p->utf8.size), utf8Skip(p->utf8.data, p->utf8.size, idx))
STRING_VT(string_skiplist16, NOOP, if (p->skip.list) gcMarkArray(p->skip.list), 2 * sizeof(void *),
          PXT_SKIP_DATA_IND(p), p->skip.size, p->skip.length, skipLookup(p, idx, 0))
STRING_VT(string_skiplist16_packed, NOOP, NOOP,
          2 + 2 + PXT_NUM_SKIP_ENTRIES(p) * 2 + p->skip.size + 1, PXT_SKIP_DATA_PACK(p),
          p->skip.size, p->skip.length, skipLookup(p, idx, 1))
STRING_VT(string_cons, fixCons(p), (gcScan((TValue)p->cons.left), gcScan((TValue)p->cons.right)),
          2 * sizeof(void *), PXT_SKIP_DATA_IND(p), p->skip.size, p->skip.length,
          skipLookup(p, idx, 0))
#endif

PRIM_VTABLE(number, ValType::Number, BoxedNumber, 0)
PRIM_VTABLE(buffer, ValType::Object, BoxedBuffer, p->length)
// PRIM_VTABLE(action, ValType::Function, RefAction, )

void failedCast(TValue v, void *addr) {
    DMESG("failed type check for %p @%p", v, addr);
    auto vt = getAnyVTable(v);
    if (vt) {
        DMESG("VT %p - objtype %d classNo %d", vt, vt->objectType, vt->classNo);
    }

    int code;
    if (v == TAG_NULL)
        code = PANIC_CAST_FROM_NULL;
    else
        code = PANIC_CAST_FIRST + (int)valType(v);
    soft_panic(code);
}

void missingProperty(TValue v) {
    DMESG("missing property on %p", v);
    soft_panic(PANIC_MISSING_PROPERTY);
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
    if (!perfCounters)
        return;
    auto c = &perfCounters[(uint32_t)n];
    if (c->start)
        oops(50);
    c->start = PERF_NOW();
}

void stopPerfCounter(PerfCounters n) {
    if (!perfCounters)
        return;
    auto c = &perfCounters[(uint32_t)n];
    if (!c->start)
        oops(51);
    c->value += PERF_NOW() - c->start;
    c->start = 0;
    c->numstops++;
}
#endif

// Exceptions

#ifndef PXT_EXN_CTX
#define PXT_EXN_CTX() getThreadContext()
#endif

typedef void (*RestoreStateType)(TryFrame *, ThreadContext *);
#ifndef pxt_restore_exception_state
#define pxt_restore_exception_state ((RestoreStateType)(((uintptr_t *)bytecode)[14]))
#endif

//%
TryFrame *beginTry() {
    auto ctx = PXT_EXN_CTX();
    auto frame = (TryFrame *)app_alloc(sizeof(TryFrame));
    frame->parent = ctx->tryFrame;
    ctx->tryFrame = frame;
    return frame;
}

//% expose
void endTry() {
    auto ctx = PXT_EXN_CTX();
    auto f = ctx->tryFrame;
    if (!f)
        oops(51);
    ctx->tryFrame = f->parent;
    app_free(f);
}

//% expose
void throwValue(TValue v) {
    auto ctx = PXT_EXN_CTX();
    auto f = ctx->tryFrame;
    if (!f) {
        DMESG("unhandled exception, value:");
        anyPrint(v);
        soft_panic(PANIC_UNHANDLED_EXCEPTION);
    }
    ctx->tryFrame = f->parent;
    TryFrame copy = *f;
    app_free(f);
    ctx->thrownValue = v;
    pxt_restore_exception_state(&copy, ctx);
}

//% expose
TValue getThrownValue() {
    auto ctx = PXT_EXN_CTX();
    auto v = ctx->thrownValue;
    ctx->thrownValue = TAG_NON_VALUE;
    if (v == TAG_NON_VALUE)
        oops(51);
    return v;
}

//% expose
void endFinally() {
    auto ctx = PXT_EXN_CTX();
    if (ctx->thrownValue == TAG_NON_VALUE)
        return;
    throwValue(getThrownValue());
}

// https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
uint32_t hash_fnv1(const void *data, unsigned len) {
    const uint8_t *d = (const uint8_t *)data;
    uint32_t h = 0x811c9dc5;
    while (len--)
        h = (h * 0x1000193) ^ *d++;
    return h;
}

// redefined in melody.cpp
__attribute__((weak)) int redirectSamples(int16_t *dst, int numsamples, int samplerate) {
    return 0;
}

} // namespace pxt

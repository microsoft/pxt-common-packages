#include "pxtbase.h"

using namespace std;

namespace pxt {

TValue incr(TValue e) {
    if (isRefCounted(e)) {
        getVTable((RefObject *)e);
        ((RefObject *)e)->ref();
    }
    return e;
}

void decr(TValue e) {
#if 0
        if (isRefCounted(e) && ((RefObject *)e)->refcnt != 0xffff) {
            DMESG("DECR: %p refs=%d vt=%p", e, ((RefObject *)e)->refcnt,
                    ((RefObject *)e)->vtable);
        }
#endif


    if (isRefCounted(e)) {
        ((RefObject *)e)->unref();
    }
}

// TODO
Action mkAction(int reflen, int totallen, int startptr) {
    check(0 <= reflen && reflen <= totallen, ERR_SIZE, 1);
    check(reflen <= totallen && totallen <= 255, ERR_SIZE, 2);
    check(bytecode[startptr] == 0xffff, ERR_INVALID_BINARY_HEADER, 3);
    check(bytecode[startptr + 1] == PXT_REF_TAG_ACTION, ERR_INVALID_BINARY_HEADER, 4);

    unsigned tmp = (unsigned)&bytecode[startptr];

    if (totallen == 0) {
        return (TValue)tmp; // no closure needed
    }

    void *ptr = ::operator new(sizeof(RefAction) + totallen * sizeof(unsigned));
    RefAction *r = new (ptr) RefAction();
    r->len = totallen;
    r->reflen = reflen;
    r->func = (ActionCB)((tmp + 4) | 1);
    memset(r->fields, 0, r->len * sizeof(unsigned));

    return (Action)r;
}

// TODO
TValue runAction3(Action a, TValue arg0, TValue arg1, TValue arg2) {
    auto aa = (RefAction *)a;
    if (aa->vtable == PXT_REF_TAG_ACTION) {
        check(aa->refcnt == 0xffff, ERR_INVALID_BINARY_HEADER, 4);
        return ((ActionCB)(((uint32_t)a + 4) | 1))(NULL, arg0, arg1, arg2);
    } else {
        check(aa->refcnt != 0xffff, ERR_INVALID_BINARY_HEADER, 4);
        return aa->runCore(arg0, arg1, arg2);
    }
}

TValue runAction2(Action a, TValue arg0, TValue arg1) {
    return runAction3(a, arg0, arg1, 0);
}

TValue runAction1(Action a, TValue arg0) {
    return runAction3(a, arg0, 0, 0);
}

TValue runAction0(Action a) {
    return runAction3(a, 0, 0, 0);
}

RefRecord *mkClassInstance(int vtableOffset) {
    VTable *vtable = (VTable *)&bytecode[vtableOffset];

    intcheck(vtable->methods[0] == &RefRecord_destroy, ERR_SIZE, 3);
    intcheck(vtable->methods[1] == &RefRecord_print, ERR_SIZE, 4);

    void *ptr = ::operator new(vtable->numbytes);
    RefRecord *r = new (ptr) RefRecord(PXT_VTABLE_TO_INT(vtable));
    memset(r->fields, 0, vtable->numbytes - sizeof(RefRecord));
    return r;
}

TValue RefRecord::ld(int idx) {
    // intcheck((reflen == 255 ? 0 : reflen) <= idx && idx < len, ERR_OUT_OF_BOUNDS, 1);
    return fields[idx];
}

TValue RefRecord::ldref(int idx) {
    // DMESG("LD %p len=%d reflen=%d idx=%d", this, len, reflen, idx);
    // intcheck(0 <= idx && idx < reflen, ERR_OUT_OF_BOUNDS, 2);
    TValue tmp = fields[idx];
    incr(tmp);
    return tmp;
}

void RefRecord::st(int idx, TValue v) {
    // intcheck((reflen == 255 ? 0 : reflen) <= idx && idx < len, ERR_OUT_OF_BOUNDS, 3);
    fields[idx] = v;
}

void RefRecord::stref(int idx, TValue v) {
    // DMESG("ST %p len=%d reflen=%d idx=%d", this, len, reflen, idx);
    // intcheck(0 <= idx && idx < reflen, ERR_OUT_OF_BOUNDS, 4);
    decr(fields[idx]);
    fields[idx] = v;
}

void RefObject::destroyVT() {
    ((RefObjectMethod)getVTable(this)->methods[0])(this);
    ::operator delete(this);
}

void RefObject::printVT() {
    ((RefObjectMethod)getVTable(this)->methods[1])(this);
}

void RefRecord_destroy(RefRecord *r) {
    VTable *tbl = getVTable(r);
    uint8_t *refmask = (uint8_t *)&tbl->methods[tbl->userdata & 0xff];
    int len = (tbl->numbytes >> 2) - 1;
    for (int i = 0; i < len; ++i) {
        if (refmask[i])
            decr(r->fields[i]);
        r->fields[i] = 0;
    }
}

void RefRecord_print(RefRecord *r) {
    DMESG("RefRecord %p r=%d size=%d bytes", r, r->refcnt, getVTable(r)->numbytes);
}

TValue Segment::get(unsigned i) {
#ifdef DEBUG_BUILD
    DMESG("In Segment::get index:%d", i);
    this->print();
#endif

    if (i < length) {
        return data[i];
    }
    return Segment::DefaultValue;
}

void Segment::setRef(unsigned i, TValue value) {
    decr(get(i));
    set(i, value);
}

void Segment::set(unsigned i, TValue value) {
    if (i < size) {
        data[i] = value;
    } else if (i < Segment::MaxSize) {
        growByMin(i + 1);
        data[i] = value;
    }
    if (length <= i) {
        length = i + 1;
    }

#ifdef DEBUG_BUILD
    DMESG("In Segment::set");
    this->print();
#endif

    return;
}

uint16_t Segment::growthFactor(uint16_t size) {
    if (size == 0) {
        return 4;
    }
    if (size < 64) {
        return size * 2; // Double
    }
    if (size < 512) {
        return size * 5 / 3; // Grow by 1.66 rate
    }
    return size + 256; // Grow by constant rate
}

void Segment::growByMin(uint16_t minSize) {
    growBy(max(minSize, growthFactor(size)));
}

void Segment::growBy(uint16_t newSize) {
#ifdef DEBUG_BUILD
    DMESG("growBy: %d", newSize);
    this->print();
#endif
    if (size < newSize) {
        // this will throw if unable to allocate
        TValue *tmp = (TValue *)(::operator new(newSize * sizeof(TValue)));

        // Copy existing data
        if (size) {
            memcpy(tmp, data, size * sizeof(TValue));
        }
        // fill the rest with default value
        memset(tmp + size, 0, (newSize - size) * sizeof(TValue));

        // free older segment;
        ::operator delete(data);

        data = tmp;
        size = newSize;

#ifdef DEBUG_BUILD
        DMESG("growBy - after reallocation");
        this->print();
#endif
    }
    // else { no shrinking yet; }
    return;
}

void Segment::ensure(uint16_t newSize) {
    if (newSize < size) {
        return;
    }
    growByMin(newSize);
}

void Segment::setLength(unsigned newLength) {
    if (newLength > size) {
        ensure(length);
    }
    length = newLength;
    return;
}

void Segment::push(TValue value) {
    this->set(length, value);
}

TValue Segment::pop() {
#ifdef DEBUG_BUILD
    DMESG("In Segment::pop");
    this->print();
#endif

    if (length > 0) {
        --length;
        TValue value = data[length];
        data[length] = Segment::DefaultValue;
        return value;
    }
    return Segment::DefaultValue;
}

// this function removes an element at index i and shifts the rest of the elements to
// left to fill the gap
TValue Segment::remove(unsigned i) {
#ifdef DEBUG_BUILD
    DMESG("In Segment::remove index:%d", i);
    this->print();
#endif
    if (i < length) {
        // value to return
        TValue ret = data[i];
        if (i + 1 < length) {
            // Move the rest of the elements to fill in the gap.
            memmove(data + i, data + i + 1, (length - i - 1) * sizeof(unsigned));
        }
        length--;
        data[length] = Segment::DefaultValue;
#ifdef DEBUG_BUILD
        DMESG("After Segment::remove index:%d", i);
        this->print();
#endif
        return ret;
    }
    return Segment::DefaultValue;
}

// this function inserts element value at index i by shifting the rest of the elements right.
void Segment::insert(unsigned i, TValue value) {
#ifdef DEBUG_BUILD
    DMESG("In Segment::insert index:%d value:%d", i, value);
    this->print();
#endif

    if (i < length) {
        ensure(length + 1);
        if (i + 1 < length) {
            // Move the rest of the elements to fill in the gap.
            memmove(data + i + 1, data + i, (length - i) * sizeof(unsigned));
        }

        data[i] = value;
        length++;
    } else {
        // This is insert beyond the length, just call set which will adjust the length
        set(i, value);
    }
#ifdef DEBUG_BUILD
    DMESG("After Segment::insert index:%d", i);
    this->print();
#endif
}

void Segment::print() {
    DMESG("Segment: %p, length: %d, size: %d", data, (unsigned)length, (unsigned)size);
    for (unsigned i = 0; i < size; i++) {
        DMESG("-> %d", (unsigned)data[i]);
    }
}

bool Segment::isValidIndex(unsigned i) {
    if (i > length) {
        return false;
    }
    return true;
}

void Segment::destroy() {
#ifdef DEBUG_BUILD
    DMESG("In Segment::destroy");
    this->print();
#endif
    length = size = 0;
    ::operator delete(data);
    data = nullptr;
}

void RefCollection::push(TValue x) {
    incr(x);
    head.push(x);
}

TValue RefCollection::pop() {
    TValue ret = head.pop();
    incr(ret);
    return ret;
}

TValue RefCollection::getAt(int i) {
    TValue tmp = head.get(i);
    incr(tmp);
    return tmp;
}

TValue RefCollection::removeAt(int i) {
    return head.remove(i);
}

void RefCollection::insertAt(int i, TValue value) {
    head.insert(i, value);
    incr(value);
}

void RefCollection::setAt(int i, TValue value) {
    incr(value);
    head.setRef(i, value);
}

int RefCollection::indexOf(TValue x, int start) {
    unsigned i = start;
    while (head.isValidIndex(i)) {
        if (pxt::eq_bool(head.get(i), x)) {
            return (int)i;
        }
        i++;
    }
    return -1;
}

bool RefCollection::removeElement(TValue x) {
    int idx = indexOf(x, 0);
    if (idx >= 0) {
        decr(removeAt(idx));
        return 1;
    }
    return 0;
}

namespace Coll0 {
PXT_VTABLE_BEGIN(RefCollection, 0, 0)
PXT_VTABLE_END
}

RefCollection::RefCollection() : RefObject(0) {
    vtable = PXT_VTABLE_TO_INT(&Coll0::RefCollection_vtable);
}

void RefCollection::destroy() {
    for (unsigned i = 0; i < this->head.getLength(); i++) {
        decr(this->head.get(i));
    }
    this->head.destroy();
}

void RefCollection::print() {
    DMESG("RefCollection %p r=%d size=%d", this, refcnt, head.getLength());
    head.print();
}

PXT_VTABLE_CTOR(RefAction) {}

// fields[] contain captured locals
void RefAction::destroy() {
    for (int i = 0; i < this->reflen; ++i) {
        decr(fields[i]);
        fields[i] = 0;
    }
}

void RefAction::print() {
    DMESG("RefAction %p r=%d pc=%X size=%d (%d refs)", this, refcnt,
          (const uint8_t *)func - (const uint8_t *)bytecode, len, reflen);
}

void RefLocal::print() {
    DMESG("RefLocal %p r=%d v=%d", this, refcnt, v);
}

void RefLocal::destroy() {}

PXT_VTABLE_CTOR(RefLocal) {
    v = 0;
}

PXT_VTABLE_CTOR(RefRefLocal) {
    v = 0;
}

void RefRefLocal::print() {
    DMESG("RefRefLocal %p r=%d v=%p", this, refcnt, (void *)v);
}

void RefRefLocal::destroy() {
    decr(v);
}

PXT_VTABLE_BEGIN(RefMap, 0, RefMapMarker)
PXT_VTABLE_END
RefMap::RefMap() : PXT_VTABLE_INIT(RefMap) {}

void RefMap::destroy() {
    for (unsigned i = 0; i < values.getLength(); ++i) {
        decr(values.get(i));
        values.set(i, 0);
    }
    keys.destroy();
    values.destroy();
}

int RefMap::findIdx(unsigned key) {
    for (unsigned i = 0; i < keys.getLength(); ++i) {
        if ((unsigned)keys.get(i) == key)
            return i;
    }
    return -1;
}

void RefMap::print() {
    DMESG("RefMap %p r=%d size=%d", this, refcnt, keys.getLength());
}

#ifdef PXT_MEMLEAK_DEBUG
std::set<TValue> allptrs;
void debugMemLeaks() {
    DMESG("LIVE POINTERS:");
    for (std::set<TValue>::iterator itr = allptrs.begin(); itr != allptrs.end(); itr++) {
        anyPrint(*itr);
    }
    DMESG("LIVE POINTERS END.");
    dumpDmesg();
}
#else
void debugMemLeaks() {}
#endif




void error(ERROR code, int subcode) {
    DMESG("Error: %d [%d]", code, subcode);
    target_panic(42);
}

uint16_t *bytecode;
TValue *globals;

unsigned *allocate(uint16_t sz) {
    unsigned *arr = new unsigned[sz];
    memset(arr, 0, sz * sizeof(unsigned));
    return arr;
}

void checkStr(bool cond, const char *msg) {
    if (!cond) {
        while (true) {
            // uBit.display.scroll(msg, 100);
            // uBit.sleep(100);
        }
    }
}

int templateHash() {
    return ((int *)bytecode)[4];
}

int programHash() {
    return ((int *)bytecode)[6];
}

int getNumGlobals() {
    return bytecode[16];
}

void exec_binary(unsigned *pc) {
    // XXX re-enable once the calibration code is fixed and [editor/embedded.ts]
    // properly prepends a call to [internal_main].
    // ::touch_develop::internal_main();

    // unique group for radio based on source hash
    // ::touch_develop::micro_bit::radioDefaultGroup = programHash();

    // repeat error 4 times and restart as needed
    // microbit_panic_timeout(4);

    unsigned ver = *pc++;
    checkStr(ver == 0x4209, ":( Bad runtime version");

    bytecode = *((uint16_t **)pc++); // the actual bytecode is here
    globals = (TValue *)allocate(getNumGlobals());

    if (*HF2_DBG_MAGIC_PTR == HF2_DBG_MAGIC_START) {
        *HF2_DBG_MAGIC_PTR = 0;
        // this will cause alignment fault at the first breakpoint
        globals[0] = (TValue)1;
    } else {
        // can be any valid address, best in RAM for speed
        globals[0] = (TValue)&globals;
    }

    // just compare the first word
    // TODO
    checkStr(((uint32_t *)bytecode)[0] == 0x923B8E70 && (unsigned)templateHash() == *pc,
             ":( Failed partial flash");

    unsigned startptr = (unsigned)bytecode;
    
    startptr += 48; // header
    startptr |= 1;  // Thumb state

    initRuntime();

    ((unsigned(*)())startptr)();

#ifdef PXT_MEMLEAK_DEBUG
    pxt::debugMemLeaks();
#endif

    while (1) {
        sleep_ms(10000);
    }
}

void start() {
    exec_binary((unsigned *)functionsAndBytecode);
}

} // end namespace

#include "pxtbase.h"

/*
TODO64
- can you mmap /dev/zero on iOS, Windows, XBox, Android
- use the same tagged pointer scheme?
- what about integers?
- where are programs loaded on each platform?
*/

#ifndef GC_BLOCK_SIZE
#define GC_BLOCK_SIZE (1024 * 16)
#endif

#ifndef GC_MAX_ALLOC_SIZE
#define GC_MAX_ALLOC_SIZE (GC_BLOCK_SIZE - 16)
#endif

#ifndef GC_ALLOC_BLOCK
#define GC_ALLOC_BLOCK xmalloc
#endif

#ifdef PXT64
#define HIGH_SHIFT 48
#define BYTES_TO_WORDS(x) ((x) >> 3)
#define WORDS_TO_BYTES(x) ((x) << 3)
#define ALIGN_TO_WORD(x) (((x) + 7) & (~7UL))
#define VAR_BLOCK_WORDS(vt) ((uint32_t)((vt) >> 2))
#else
#define HIGH_SHIFT 28
#define BYTES_TO_WORDS(x) ((x) >> 2)
#define WORDS_TO_BYTES(x) ((x) << 2)
#define ALIGN_TO_WORD(x) (((x) + 3) & (~3U))
#define VAR_BLOCK_WORDS(vt) (((vt) << 16) >> (16 + 2))
#endif

#define FREE_MASK (1UL << (HIGH_SHIFT + 3))
#define ARRAY_MASK (1UL << (HIGH_SHIFT + 2))
#define PERMA_MASK (1UL << (HIGH_SHIFT + 1))
#define MARKED_MASK 0x1
#define ANY_MARKED_MASK 0x3

// the bit operations should be faster than loading large constants
#define IS_FREE(vt) ((uintptr_t)(vt) >> (HIGH_SHIFT + 3))
#define IS_ARRAY(vt) (((uintptr_t)(vt) >> (HIGH_SHIFT + 2)) & 1)
#define IS_PERMA(vt) (((uintptr_t)(vt) >> (HIGH_SHIFT + 1)) & 1)
#define IS_VAR_BLOCK(vt) ((uintptr_t)(vt) >> (HIGH_SHIFT + 2))
#define IS_MARKED(vt) ((uintptr_t)(vt)&MARKED_MASK)
#define IS_LIVE(vt) (IS_MARKED(vt) || (((uintptr_t)(vt) >> (HIGH_SHIFT)) == 0x6))

//#define PXT_GC_DEBUG 1
#ifndef PXT_GC_CHECKS
#define PXT_GC_CHECKS 1
#endif
//#define PXT_GC_STRESS 1

#define MARK(v)                                                                                    \
    do {                                                                                           \
        GC_CHECK(inGCArea(v), 42);                                                                 \
        *(uintptr_t *)(v) |= MARKED_MASK;                                                          \
    } while (0)

#ifdef PXT_GC_DEBUG
#define LOG DMESG
#define VLOG DMESG
#define VVLOG DMESG
#else
#define LOG NOLOG
#define VLOG NOLOG
#define VVLOG NOLOG
#endif

#ifdef PXT_GC_CHECKS
#define GC_CHECK(cond, code)                                                                       \
    if (!(cond))                                                                                   \
    oops(code)
#else
#define GC_CHECK(cond, code) ((void)0)
#endif

namespace pxt {

//%
void popThreadContext(ThreadContext *ctx);
//%
ThreadContext *pushThreadContext(void *sp, void *endSP);

unsigned RefRecord_gcsize(RefRecord *r) {
    VTable *tbl = getVTable(r);
    return BYTES_TO_WORDS(tbl->numbytes);
}

#ifndef PXT_GC
// dummies, to make the linker happy
void popThreadContext(ThreadContext *ctx) {}
ThreadContext *pushThreadContext(void *sp, void *endSP) {
    return NULL;
}
void RefRecord_scan(RefRecord *r) {}
#else

#ifdef PXT_GC_THREAD_LIST
ThreadContext *threadContexts;
#endif

#define IN_GC_ALLOC 1
#define IN_GC_COLLECT 2
#define IN_GC_FREEZE 4
#define IN_GC_PREALLOC 8

static TValue *tempRoot;
static uint8_t tempRootLen;

#ifdef PXT_VM
uint8_t inGC = IN_GC_PREALLOC;
#else
uint8_t inGC;
#endif

void popThreadContext(ThreadContext *ctx) {
#ifndef PXT_VM
    VLOG("pop: %p", ctx);

    if (!ctx)
        return;

    auto n = ctx->stack.next;
    if (n) {
        VLOG("seg %p", n);
        ctx->stack.top = n->top;
        ctx->stack.bottom = n->bottom;
        ctx->stack.next = n->next;
        app_free(n);
    } else {
#ifdef PXT_GC_THREAD_LIST
        if (ctx->next)
            ctx->next->prev = ctx->prev;
        if (ctx->prev)
            ctx->prev->next = ctx->next;
        else {
            if (threadContexts != ctx)
                oops(41);
            threadContexts = ctx->next;
            if (threadContexts)
                threadContexts->prev = NULL;
        }
#endif
        app_free(ctx);
        setThreadContext(NULL);
    }
#endif
}

#define ALLOC(tp) (tp *)app_alloc(sizeof(tp))

ThreadContext *pushThreadContext(void *sp, void *endSP) {
#ifdef PXT_VM
    return NULL;
#else
    if (PXT_IN_ISR())
        target_panic(PANIC_CALLED_FROM_ISR);

    auto curr = getThreadContext();
    tempRoot = (TValue *)endSP;
    tempRootLen = (uintptr_t *)sp - (uintptr_t *)endSP;
    if (curr) {
#ifdef PXT_GC_THREAD_LIST
#ifdef PXT_GC_DEBUG
        auto ok = false;
        for (auto p = threadContexts; p; p = p->next)
            if (p == curr) {
                ok = true;
                break;
            }
        if (!ok)
            oops(49);
#endif
#endif
        auto seg = ALLOC(StackSegment);
        VLOG("stack %p / %p", seg, curr);
        seg->top = curr->stack.top;
        seg->bottom = curr->stack.bottom;
        seg->next = curr->stack.next;
        curr->stack.next = seg;
    } else {
        curr = ALLOC(ThreadContext);
        LOG("push: %p", curr);
        curr->globals = globals;
        curr->stack.next = NULL;

#ifdef PXT_GC_THREAD_LIST
        curr->next = threadContexts;
        curr->prev = NULL;
        if (curr->next)
            curr->next->prev = curr;
        threadContexts = curr;
#endif
        setThreadContext(curr);
    }
    tempRootLen = 0;
    curr->stack.bottom = sp;
    curr->stack.top = NULL;
    return curr;
#endif
}

class RefBlock : public RefObject {
  public:
    RefBlock *nextFree;
};

struct GCBlock {
    GCBlock *next;
    uint32_t blockSize;
    RefObject data[0];
};

static LLSegment gcRoots;
LLSegment workQueue; // (ab)used by consString making
static GCBlock *firstBlock;
static RefBlock *firstFree;
static uint8_t *midPtr;

static bool inGCArea(void *ptr) {
    for (auto block = firstBlock; block; block = block->next) {
        if ((void *)block->data <= ptr && ptr < (void *)((uint8_t *)block->data + block->blockSize))
            return true;
    }
    return false;
}

#define NO_MAGIC(vt) ((VTable *)vt)->magic != VTABLE_MAGIC
#define VT(p) (*(uintptr_t *)(p))
#define SKIP_PROCESSING(p)                                                                         \
    (isReadOnly(p) || (VT(p) & (ANY_MARKED_MASK | ARRAY_MASK)) || NO_MAGIC(VT(p)))

void gcMarkArray(void *data) {
    auto segBl = (uintptr_t *)data - 1;
    GC_CHECK(!IS_MARKED(VT(segBl)), 47);
    MARK(segBl);
}

void gcScan(TValue v) {
    if (SKIP_PROCESSING(v))
        return;
    MARK(v);
    workQueue.push(v);
}

void gcScanMany(TValue *data, unsigned len) {
    // VLOG("scan: %p %d", data, len);
    for (unsigned i = 0; i < len; ++i) {
        auto v = data[i];
        // VLOG("psh: %p %d %d", v, isReadOnly(v), (*(uint32_t *)v & 1));
        if (SKIP_PROCESSING(v))
            continue;
        MARK(v);
        workQueue.push(v);
    }
}

void gcScanSegment(Segment &seg) {
    auto data = seg.getData();
    if (!data)
        return;
    gcMarkArray(data);
    gcScanMany(data, seg.getLength());
}

#define getScanMethod(vt) ((RefObjectMethod)(((VTable *)(vt))->methods[2]))
#define getSizeMethod(vt) ((RefObjectSizeMethod)(((VTable *)(vt))->methods[3]))

void gcProcess(TValue v) {
    if (SKIP_PROCESSING(v))
        return;
    VVLOG("gcProcess: %p", v);
    MARK(v);
    auto scan = getScanMethod(VT(v) & ~ANY_MARKED_MASK);
    if (scan)
        scan((RefObject *)v);
    while (workQueue.getLength()) {
        auto curr = (RefObject *)workQueue.pop();
        VVLOG(" - %p", curr);
        scan = getScanMethod(curr->vtable & ~ANY_MARKED_MASK);
        if (scan)
            scan(curr);
    }
}

static void mark(int flags) {
#ifdef PXT_GC_DEBUG
    flags |= 2;
#endif
    auto data = gcRoots.getData();
    auto len = gcRoots.getLength();
    if (flags & 2) {
        DMESG("--MARK");
        DMESG("RP:%p/%d", data, len);
    }
    for (unsigned i = 0; i < len; ++i) {
        auto d = data[i];
        if ((uintptr_t)d & 1) {
            d = *(TValue *)((uintptr_t)d & ~1);
        }
        gcProcess(d);
    }

#ifdef PXT_GC_THREAD_LIST
    for (auto ctx = threadContexts; ctx; ctx = ctx->next) {
        for (auto seg = &ctx->stack; seg; seg = seg->next) {
            auto ptr = (TValue *)threadAddressFor(ctx, seg->top);
            auto end = (TValue *)threadAddressFor(ctx, seg->bottom);
            VLOG("mark: %p - %p", ptr, end);
            while (ptr < end) {
                gcProcess(*ptr++);
            }
        }
    }
#else
    gcProcessStacks(flags);
#endif

    if (globals) {
#ifdef PXT_VM
        auto nonPtrs = vmImg->infoHeader->nonPointerGlobals;
#else
        auto nonPtrs = bytecode[21];
#endif
        len = getNumGlobals() - nonPtrs;
        data = globals + nonPtrs;
        if (flags & 2)
            DMESG("RG:%p/%d", data, len);
        VLOG("globals: %p %d", data, len);
        for (unsigned i = 0; i < len; ++i) {
            gcProcess(*data++);
        }
    }

    data = tempRoot;
    len = tempRootLen;
    for (unsigned i = 0; i < len; ++i) {
        gcProcess(*data++);
    }
}

static uint32_t getObjectSize(RefObject *o) {
    auto vt = o->vtable & ~ANY_MARKED_MASK;
    uint32_t r;
    GC_CHECK(vt != 0, 49);
    if (IS_VAR_BLOCK(vt)) {
        r = VAR_BLOCK_WORDS(vt);
    } else {
        auto sz = getSizeMethod(vt);
        // GC_CHECK(0x2000 <= (intptr_t)sz && (intptr_t)sz <= 0x100000, 47);
        r = sz(o);
    }
    GC_CHECK(1 <= r && (r <= BYTES_TO_WORDS(GC_MAX_ALLOC_SIZE) || IS_FREE(vt)), 48);
    return r;
}

__attribute__((noinline)) static void allocateBlock() {
    auto sz = GC_BLOCK_SIZE;
    void *dummy = NULL;
#ifdef GC_GET_HEAP_SIZE
    if (firstBlock) {
        gc(2); // dump roots
        target_panic(PANIC_GC_OOM);
    }
    auto lowMem = getConfig(CFG_LOW_MEM_SIMULATION_KB, 0);
    auto sysHeapSize = getConfig(CFG_SYSTEM_HEAP_BYTES, 4 * 1024);
    auto heapSize = GC_GET_HEAP_SIZE();
    sz = heapSize - sysHeapSize;
    if (lowMem) {
        auto memIncrement = 32 * 1024;
        // get the memory size - assume it's increment of 32k,
        // and we don't statically allocate more than 32k
        auto memSize = ((heapSize + memIncrement - 1) / memIncrement) * memIncrement;
        int fillerSize = memSize - lowMem * 1024;
        if (fillerSize > 0) {
            dummy = GC_ALLOC_BLOCK(fillerSize);
            sz -= fillerSize;
        }
    }
#endif
    auto curr = (GCBlock *)GC_ALLOC_BLOCK(sz);
    curr->blockSize = sz - sizeof(GCBlock);
    LOG("GC alloc: %p", curr);
    GC_CHECK((curr->blockSize & 3) == 0, 40);
    curr->data[0].vtable = FREE_MASK | (TOWORDS(curr->blockSize) << 2);
    ((RefBlock *)curr->data)[0].nextFree = firstFree;
    firstFree = (RefBlock *)curr->data;
    // make sure reference to allocated block is stored somewhere, otherwise
    // GCC optimizes out the call to GC_ALLOC_BLOCK
    curr->data[4].vtable = (uintptr_t)dummy;
    curr->next = NULL;
    if (!firstBlock) {
        firstBlock = curr;
    } else {
        for (auto p = firstBlock; p; p = p->next) {
            if (!p->next) {
                GC_CHECK(p < curr, 40); // required by midPtr stuff
                p->next = curr;
                break;
            }
        }
    }
    midPtr = (uint8_t *)curr->data + curr->blockSize / 4;
}

static void sweep(int flags) {
    RefBlock *prevFreePtr = NULL;
    uint32_t freeSize = 0;
    uint32_t totalSize = 0;
    firstFree = NULL;

    for (auto h = firstBlock; h; h = h->next) {
        auto d = h->data;
        auto words = BYTES_TO_WORDS(h->blockSize);
        auto end = d + words;
        totalSize += words;
        VLOG("sweep: %p - %p", d, end);
        while (d < end) {
            if (IS_LIVE(d->vtable)) {
                VVLOG("Live %p", d);
                d->vtable &= ~MARKED_MASK;
                d += getObjectSize(d);
            } else {
                auto start = (RefBlock *)d;
                while (d < end) {
                    if (IS_FREE(d->vtable)) {
                        VVLOG("Free %p", d);
                    } else if (IS_LIVE(d->vtable)) {
                        break;
                    } else if (IS_ARRAY(d->vtable)) {
                        VVLOG("Dead Arr %p", d);
                    } else {
                        VVLOG("Dead Obj %p", d);
                        GC_CHECK(((VTable *)d->vtable)->magic == VTABLE_MAGIC, 41);
                        d->destroyVT();
                        VVLOG("destroyed");
                    }
                    d += getObjectSize(d);
                }
                auto sz = d - (RefObject *)start;
                freeSize += sz;
#ifdef PXT_GC_CHECKS
                memset(start, 0xff, WORDS_TO_BYTES(sz));
#endif
                start->vtable = (sz << 2) | FREE_MASK;
                if (sz > 1) {
                    start->nextFree = NULL;
                    if (!prevFreePtr) {
                        firstFree = start;
                    } else {
                        prevFreePtr->nextFree = start;
                    }
                    prevFreePtr = start;
                }
            }
        }
    }

    if (midPtr) {
        uint32_t currFree = 0;
        auto limit = freeSize >> 2;
        for (auto p = firstFree; p; p = p->nextFree) {
            currFree += VAR_BLOCK_WORDS(p->vtable);
            if (currFree > limit) {
                midPtr = (uint8_t *)p + ((currFree - limit) << 2);
                break;
            }
        }
    }

    freeSize = WORDS_TO_BYTES(freeSize);
    totalSize = WORDS_TO_BYTES(totalSize);

    if (flags & 1)
        DMESG("GC %d/%d free", freeSize, totalSize);
    else
        LOG("GC %d/%d free", freeSize, totalSize);

#ifndef GC_GET_HEAP_SIZE
    // if the heap is 90% full, allocate a new block
    if (freeSize * 10 <= totalSize) {
        allocateBlock();
    }
#endif
}

void gc(int flags) {
    startPerfCounter(PerfCounters::GC);
    GC_CHECK(!(inGC & IN_GC_COLLECT), 40);
    inGC |= IN_GC_COLLECT;
    VLOG("GC mark");
    mark(flags);
    VLOG("GC sweep");
    sweep(flags);
    VLOG("GC done");
    stopPerfCounter(PerfCounters::GC);
    inGC &= ~IN_GC_COLLECT;
}

#ifdef GC_GET_HEAP_SIZE
extern "C" void free(void *ptr) {
    if (!ptr)
        return;
    if (inGCArea(ptr))
        app_free(ptr);
    else
        xfree(ptr);
}

extern "C" void *malloc(size_t sz) {
    if (PXT_IN_ISR() || inGC)
        return xmalloc(sz);
    else
        return app_alloc(sz);
}

extern "C" void *realloc(void *ptr, size_t size) {
    if (inGCArea(ptr)) {
        void *mem = malloc(size);

        if (ptr != NULL && mem != NULL) {
            auto r = (uintptr_t *)ptr;
            GC_CHECK((r[-1] >> (HIGH_SHIFT + 1)) == 3, 41);
            size_t blockSize = VAR_BLOCK_WORDS(r[-1]);
            memcpy(mem, ptr, min(blockSize * sizeof(void *), size));
            free(ptr);
        }

        return mem;
    } else {
        return device_realloc(ptr, size);
    }
}
#endif

void *gcAllocateArray(int numbytes) {
    numbytes = ALIGN_TO_WORD(numbytes);
    numbytes += sizeof(void *);
    auto r = (uintptr_t *)gcAllocate(numbytes);
    *r = ARRAY_MASK | (TOWORDS(numbytes) << 2);
    return r + 1;
}

void *app_alloc(int numbytes) {
    if (!numbytes)
        return NULL;

    // gc(0);
    auto r = (uintptr_t *)gcAllocateArray(numbytes);
    r[-1] |= PERMA_MASK;
    return r;
}

void *app_free(void *ptr) {
    auto r = (uintptr_t *)ptr;
    GC_CHECK((r[-1] >> (HIGH_SHIFT + 1)) == 3, 41);
    r[-1] |= FREE_MASK;
    return r;
}

void gcFreeze() {
    inGC |= IN_GC_FREEZE;
}

void gcStartup() {
    inGC &= ~IN_GC_PREALLOC;
}

void *gcAllocate(int numbytes) {
    size_t numwords = BYTES_TO_WORDS(ALIGN_TO_WORD(numbytes));
    // VVLOG("alloc %d bytes %d words", numbytes, numwords);

    if (numbytes > GC_MAX_ALLOC_SIZE)
        target_panic(PANIC_GC_TOO_BIG_ALLOCATION);

    if (PXT_IN_ISR() || (inGC & IN_GC_ALLOC))
        target_panic(PANIC_CALLED_FROM_ISR);

#ifdef PXT_VM
    if (inGC & IN_GC_PREALLOC)
        return xmalloc(numbytes);
#endif

    inGC |= IN_GC_ALLOC;

#if defined(PXT_GC_CHECKS) && !defined(PXT_VM)
    {
        auto curr = getThreadContext();
        if (curr && !curr->stack.top)
            oops(46);
    }
#endif

#ifdef PXT_GC_STRESS
    gc(0);
#endif

    for (int i = 0;; ++i) {
        RefBlock *prev = NULL;
        for (auto p = firstFree; p; p = p->nextFree) {
            VVLOG("p=%p", p);
            if (i == 0 && (uint8_t *)p > midPtr) {
                VLOG("past midptr %p; gc", midPtr);
                break;
            }
            GC_CHECK(!isReadOnly((TValue)p), 49);
            auto vt = p->vtable;
            if (!IS_FREE(vt))
                oops(43);
            int left = VAR_BLOCK_WORDS(vt) - numwords;
            // VVLOG("%p %d - %d = %d", (void*)vt, (int)VAR_BLOCK_WORDS(vt), (int)numwords, left);
            if (left >= 0) {
                auto nf = (RefBlock *)((void **)p + numwords);
                auto nextFree = p->nextFree; // p and nf can overlap when allocating 4 bytes
                // VVLOG("nf=%p nef=%p", nf, nextFree);
                if (left)
                    nf->vtable = (left << 2) | FREE_MASK;
                if (left >= 2) {
                    nf->nextFree = nextFree;
                } else {
                    nf = p->nextFree;
                }
                if (prev)
                    prev->nextFree = nf;
                else
                    firstFree = nf;
                p->vtable = 0;
                VVLOG("GC=>%p %d %p -> %p,%p", p, numwords, nf, nf ? nf->nextFree : 0,
                      nf ? (void *)nf->vtable : 0);
                GC_CHECK(!nf || !nf->nextFree || !isReadOnly((TValue)nf->nextFree), 48);
                inGC &= ~IN_GC_ALLOC;
                return p;
            }
            prev = p;
        }

        // we didn't find anything, try GC
        if (i == 0)
            gc(0);
        // GC didn't help, try new block
        else if (i == 1)
            allocateBlock();
        else
            oops(44);
    }
}

static void removePtr(TValue v) {
    int len = gcRoots.getLength();
    auto data = gcRoots.getData();
    // scan from the back, as this is often used as a stack
    for (int i = len - 1; i >= 0; --i) {
        if (data[i] == v) {
            if (i == len - 1) {
                gcRoots.pop();
            } else {
                data[i] = gcRoots.pop();
            }
            return;
        }
    }
    oops(40);
}

void registerGC(TValue *root, int numwords) {
    if (!numwords)
        return;

    if (numwords > 1) {
        while (numwords-- > 0) {
            registerGC(root++, 1);
        }
        return;
    }

    gcRoots.push((TValue)((uintptr_t)root | 1));
}

void unregisterGC(TValue *root, int numwords) {
    if (!numwords)
        return;
    if (numwords > 1) {
        while (numwords-- > 0) {
            unregisterGC(root++, 1);
        }
        return;
    }

    removePtr((TValue)((uintptr_t)root | 1));
}

void registerGCPtr(TValue ptr) {
    if (isReadOnly(ptr))
        return;
    gcRoots.push(ptr);
}

void unregisterGCPtr(TValue ptr) {
    if (isReadOnly(ptr))
        return;
    removePtr(ptr);
}

void RefImage::scan(RefImage *t) {
    gcScan((TValue)t->buffer());
}

void RefCollection::scan(RefCollection *t) {
    gcScanSegment(t->head);
}

void RefAction::scan(RefAction *t) {
    gcScanMany(t->fields, t->len);
}

void RefRefLocal::scan(RefRefLocal *t) {
    gcScan(t->v);
}

void RefMap::scan(RefMap *t) {
    gcScanSegment(t->keys);
    gcScanSegment(t->values);
}

void RefRecord_scan(RefRecord *r) {
    VTable *tbl = getVTable(r);
    gcScanMany(r->fields, BYTES_TO_WORDS(tbl->numbytes - sizeof(RefRecord)));
}

#define SIZE(off) TOWORDS(sizeof(*t) + (off))

unsigned RefImage::gcsize(RefImage *t) {
    if (t->hasBuffer())
        return SIZE(0);
    return SIZE(t->length());
}

unsigned RefCollection::gcsize(RefCollection *t) {
    return SIZE(0);
}

unsigned RefAction::gcsize(RefAction *t) {
    return SIZE(WORDS_TO_BYTES(t->len));
}

unsigned RefRefLocal::gcsize(RefRefLocal *t) {
    return SIZE(0);
}

unsigned RefMap::gcsize(RefMap *t) {
    return SIZE(0);
}

#endif

} // namespace pxt

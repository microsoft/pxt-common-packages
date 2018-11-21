#include "pxtbase.h"

#ifndef GC_BLOCK_SIZE
#define GC_BLOCK_SIZE (1024 * 16)
#endif

#define GC_BLOCK_WORDS ((GC_BLOCK_SIZE - sizeof(GCBlock)) / sizeof(void *))

#ifndef GC_ALLOC_BLOCK
#define GC_ALLOC_BLOCK xmalloc
#endif

//#define PXT_GC_DEBUG 1
#define PXT_GC_CHECKS 1

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
ThreadContext *pushThreadContext(void *sp);

unsigned RefRecord_gcsize(RefRecord *r) {
    VTable *tbl = getVTable(r);
    return tbl->numbytes >> 2;
}

#ifndef PXT_GC
// dummies, to make the linker happy
void popThreadContext(ThreadContext *ctx) {}
ThreadContext *pushThreadContext(void *sp) {
    return NULL;
}
void RefRecord_scan(RefRecord *r) {}
#else

#ifdef PXT_GC_THREAD_LIST
ThreadContext *threadContexts;
#endif

void popThreadContext(ThreadContext *ctx) {
    VLOG("pop: %p n:%p p:%p", ctx, ctx->next, ctx->prev);

    if (!ctx)
        return;

    auto n = ctx->stack.next;
    if (n) {
        VLOG("seg %p", n);
        ctx->stack.top = n->top;
        ctx->stack.bottom = n->bottom;
        ctx->stack.next = n->next;
        delete n;
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
        delete ctx;
        setThreadContext(NULL);
    }
}

ThreadContext *pushThreadContext(void *sp) {
    if (PXT_IN_ISR())
        target_panic(PANIC_CALLED_FROM_ISR);
    
    auto curr = getThreadContext();
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
        auto seg = new StackSegment;
        VLOG("stack %p / %p", seg, curr);
        seg->top = curr->stack.top;
        seg->bottom = curr->stack.bottom;
        seg->next = curr->stack.next;
        curr->stack.next = seg;
    } else {
        curr = new ThreadContext;
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
    curr->stack.bottom = sp;
    curr->stack.top = NULL;
    return curr;
}

class RefBlock : public RefObject {
  public:
    RefBlock *nextFree;
};

struct GCBlock {
    GCBlock *next;
    RefObject data[0];
};

static Segment gcRoots;
static Segment workQueue;
static GCBlock *firstBlock;
static RefBlock *firstFree;

#define IS_OUTSIDE_GC(v)                                                                           \
    (isReadOnly(v) || (*(uint32_t *)v & 1) || (*(VTable **)v)->magic != VTABLE_MAGIC)

void gcScan(TValue v) {
    if (IS_OUTSIDE_GC(v))
        return;
    *(uint32_t *)v |= 1;
    workQueue.push(v);
}

void gcScanMany(TValue *data, unsigned len) {
    // VLOG("scan: %p %d", data, len);
    for (unsigned i = 0; i < len; ++i) {
        auto v = data[i];
        // VLOG("psh: %p %d %d", v, isReadOnly(v), (*(uint32_t *)v & 1));
        if (IS_OUTSIDE_GC(v))
            continue;
        *(uint32_t *)v |= 1;
        workQueue.push(v);
    }
}

void gcScanSegment(Segment &seg) {
    gcScanMany(seg.getData(), seg.getLength());
}

#define getScanMethod(vt) ((RefObjectMethod)(((VTable *)(vt))->methods[2]))
#define getSizeMethod(vt) ((RefObjectSizeMethod)(((VTable *)(vt))->methods[3]))

void gcProcess(TValue v) {
    if (IS_OUTSIDE_GC(v))
        return;
    auto p = (RefObject *)v;
    auto vt = p->vtable;
    if (vt & 1)
        return;
    VVLOG("gcProcess: %p", p);
    auto scan = getScanMethod(vt);
    p->vtable |= 1;
    if (scan)
        scan(p);
    while (workQueue.getLength()) {
        auto curr = (RefObject *)workQueue.pop();
        VVLOG(" - %p", curr);
        scan = getScanMethod(curr->vtable & ~1);
        if (scan)
            scan(curr);
    }
}

static void mark() {
    auto data = gcRoots.getData();
    auto len = gcRoots.getLength();
    for (unsigned i = 0; i < len; ++i) {
        auto d = data[i];
        if ((uint32_t)d & 1) {
            d = *(TValue *)((uint32_t)d & ~1);
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
    gcProcessStacks();
#endif

    auto nonPtrs = bytecode[21];
    len = getNumGlobals() - nonPtrs;
    data = globals + nonPtrs;
    VLOG("globals: %p %d", data, len);
    for (unsigned i = 0; i < len; ++i) {
        gcProcess(*data++);
    }
}

static uint32_t getObjectSize(RefObject *o) {
    auto vt = o->vtable;
    uint32_t r;
    GC_CHECK(vt != 0 && !(vt & 1), 49);
    if (vt & 2) {
        r = vt >> 2;
    } else {
        auto sz = getSizeMethod(vt);
        // GC_CHECK(0x2000 <= (intptr_t)sz && (intptr_t)sz <= 0x100000, 47);
        r = sz(o);
    }
    GC_CHECK(1 <= r && r < 0x100000, 48);
    return r;
}

__attribute__((noinline)) static void allocateBlock() {
    auto curr = (GCBlock *)GC_ALLOC_BLOCK(GC_BLOCK_SIZE);
    LOG("GC alloc: %p", curr);
    curr->data[0].vtable = (GC_BLOCK_WORDS << 2) | 2;
    ((RefBlock *)curr->data)[0].nextFree = firstFree;
    firstFree = (RefBlock *)curr->data;
    curr->next = firstBlock;
    firstBlock = curr;
}

static void sweep(int verbose) {
    RefBlock *freePtr = NULL;
    uint32_t freeSize = 0;
    uint32_t totalSize = 0;
    for (auto h = firstBlock; h; h = h->next) {
        auto d = h->data;
        auto end = d + GC_BLOCK_WORDS;
        totalSize += GC_BLOCK_WORDS;
        VLOG("sweep: %p - %p", d, end);
        while (d < end) {
            if (d->vtable & 1) {
                VVLOG("Live %p", d);
                d->vtable &= ~1;
                d += getObjectSize(d);
            } else {
                auto start = (RefBlock *)d;
                while (d < end && !(d->vtable & 1)) {
                    if (d->vtable & 2) {
                        VVLOG("Free %p", d);
                    } else {
                        VVLOG("Dead %p", d);
                        d->destroyVT();
                    }
                    d += getObjectSize(d);
                }
                auto sz = d - (RefObject *)start;
                freeSize += sz;
#ifdef PXT_GC_CHECKS
                memset(start, 0xff, sz << 2);
#endif
                start->vtable = (sz << 2) | 2;
                if (sz > 1) {
                    start->nextFree = freePtr;
                    freePtr = start;
                }
            }
        }
    }
    if (verbose)
        DMESG("GC %d/%d free", freeSize, totalSize);
    else
        LOG("GC %d/%d free", freeSize, totalSize);
    firstFree = freePtr;
    // if the heap is 90% full, allocate a new block
    if (freeSize * 10 <= totalSize) {
        allocateBlock();
    }
}

void gc(int verbose) {
    startPerfCounter(PerfCounters::GC);
    VLOG("GC mark");
    mark();
    VLOG("GC sweep");
    sweep(verbose);
    VLOG("GC done");
    stopPerfCounter(PerfCounters::GC);
}

void *gcAllocate(int numbytes) {
    size_t numwords = (numbytes + 3) >> 2;

    if (numwords > GC_BLOCK_WORDS)
        oops(45);

#ifdef PXT_GC_CHECKS
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
            GC_CHECK(!isReadOnly((TValue)p), 49);
            auto vt = p->vtable;
            if (!(vt & 2))
                oops(43);
            int left = (vt >> 2) - numwords;
            if (left >= 0) {
                auto nf = (RefBlock *)((void **)p + numwords);
                // VLOG("nf=%p", nf);
                auto nextFree = p->nextFree; // p and nf can overlap when allocating 4 bytes
                if (left)
                    nf->vtable = (left << 2) | 2;
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
                GC_CHECK(!nf || !nf->nextFree || ((uint32_t)nf->nextFree) >> 20, 48);
                VVLOG("GC=>%p %d %p", p, numwords, nf->nextFree);
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
    auto len = gcRoots.getLength();
    auto data = gcRoots.getData();
    for (unsigned i = 0; i < len; ++i) {
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

    gcRoots.push((TValue)((uint32_t)root | 1));
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

    removePtr((TValue)((uint32_t)root | 1));
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
    gcScanMany(r->fields, (tbl->numbytes - sizeof(RefRecord)) >> 2);
}

#define SIZE(off) (sizeof(*t) + (off) + 3) >> 2

unsigned RefImage::gcsize(RefImage *t) {
    if (t->hasBuffer())
        return SIZE(0);
    return SIZE(t->length());
}

unsigned RefCollection::gcsize(RefCollection *t) {
    return SIZE(0);
}

unsigned RefAction::gcsize(RefAction *t) {
    return SIZE(t->len << 2);
}

unsigned RefRefLocal::gcsize(RefRefLocal *t) {
    return SIZE(0);
}

unsigned RefMap::gcsize(RefMap *t) {
    return SIZE(0);
}

#endif

} // namespace pxt

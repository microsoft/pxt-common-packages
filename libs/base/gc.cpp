#include "pxtbase.h"

#define GC_BLOCK_WORDS 1024
#define LOG DMESG

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

ThreadContext *threadContexts;

void popThreadContext(ThreadContext *ctx) {
    if (!ctx)
        return;

    auto n = ctx->stack.next;
    if (n) {
        ctx->stack.top = n->top;
        ctx->stack.bottom = n->bottom;
        ctx->stack.next = n->next;
        delete n;
    } else {
        if (ctx->next)
            ctx->next->prev = ctx->prev;
        if (ctx->prev)
            ctx->prev->next = ctx->next;
        else {
            if (threadContexts != ctx)
                oops(41);
            threadContexts = ctx->next;
        }
        delete ctx;
    }
}

ThreadContext *pushThreadContext(void *sp) {
    auto curr = getThreadContext();
    if (curr) {
        auto seg = new StackSegment;
        seg->top = curr->stack.top;
        seg->bottom = curr->stack.bottom;
        seg->next = curr->stack.next;
        curr->stack.next = seg;
    } else {
        curr = new ThreadContext;
        curr->globals = globals;
        curr->stack.next = NULL;
        curr->next = threadContexts;
        curr->prev = NULL;
        if (curr->next)
            curr->next->prev = curr;
        curr->fiber = getCurrentFiber();
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
    RefBlock data[0];
};

static Segment gcRoots;
static Segment workQueue;
static GCBlock *firstBlock;
static RefBlock *firstFree;

void gcScan(TValue v) {
    if (isReadOnly(v) || (*(uint32_t *)v & 1))
        return;
    *(uint32_t *)v |= 1;
    workQueue.push(v);
}

void gcScanMany(TValue *data, unsigned len) {
    for (unsigned i = 0; i < len; ++i) {
        auto v = data[i];
        if (isReadOnly(v) || (*(uint32_t *)v & 1))
            return;
        *(uint32_t *)v |= 1;
        workQueue.push(v);
    }
}

void gcScanSegment(Segment &seg) {
    gcScanMany(seg.getData(), seg.getLength());
}

#define getScanMethod(vt) ((RefObjectMethod)(((VTable *)(vt))->methods[2]))
#define getSizeMethod(vt) ((RefObjectSizeMethod)(((VTable *)(vt))->methods[3]))

static void process(TValue v) {
    if (isReadOnly(v))
        return;
    auto p = (RefObject *)v;
    auto vt = p->vtable;
    if (vt & 1)
        return;
    auto scan = getScanMethod(vt);
    if (scan)
        scan(p);
    while (workQueue.getLength()) {
        auto curr = (RefObject *)workQueue.pop();
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
        process(d);
    }

    for (auto ctx = threadContexts; ctx; ctx = ctx->next) {
        for (auto seg = &ctx->stack; seg; seg = seg->next) {
            auto ptr = (TValue *)threadAddressFor(ctx, seg->top);
            auto end = (TValue *)threadAddressFor(ctx, seg->bottom);
            while (ptr < end) {
                process(*ptr++);
            }
        }
    }

    auto nonPtrs = bytecode[21];
    len = getNumGlobals() - nonPtrs;
    data = globals + nonPtrs;
    for (unsigned i = 0; i < len; ++i) {
        process(*data++);
    }
}

static uint32_t getObjectSize(RefObject *o) {
    auto vt = o->vtable;
    if (vt & 2)
        return vt >> 2;
    auto sz = getSizeMethod(vt);
    return sz(o);
}

static void allocateBlock() {
    auto curr = (GCBlock *)xmalloc(sizeof(GCBlock) + GC_BLOCK_WORDS * 4);
    curr->data[0].vtable = (GC_BLOCK_WORDS << 2) | 2;
    curr->data[0].nextFree = firstFree;
    firstFree = curr->data;
    firstBlock->next = curr;
    firstBlock = curr;
}

static void sweep() {
    RefBlock *freePtr = NULL;
    uint32_t freeSize = 0;
    uint32_t totalSize = 0;
    for (auto h = firstBlock; h; h = h->next) {
        auto d = h->data;
        auto end = d + GC_BLOCK_WORDS;
        totalSize += GC_BLOCK_WORDS;
        while (d < end) {
            if (d->vtable & 1) {
                d->vtable &= ~1;
                d += getObjectSize(d);
            } else {
                auto start = d;
                while (d < end && !(d->vtable & 1)) {
                    d += getObjectSize(d);
                }
                auto sz = d - start;
                freeSize += sz;
                start->vtable = (sz << 2) | 2;
                if (sz > 1) {
                    start->nextFree = freePtr;
                    freePtr = start;
                }
            }
        }
    }
    firstFree = freePtr;
    // if the heap is 90% full, allocate a new block
    if (freeSize * 10 >= totalSize) {
        allocateBlock();
    }
}

void gc() {
    LOG("GC mark");
    mark();
    LOG("GC sweep");
    sweep();
    LOG("GC done");
}

void *gcAllocate(int numbytes) {
    int numwords = (numbytes + 3) >> 2;

    if (numwords > GC_BLOCK_WORDS)
        oops(45);

#ifdef PXT_GC_DEBUG
    auto curr = getThreadContext();
    if(!curr || !curr->stack.top)
        oops(46);
#endif

    for (int i = 0;; ++i) {
        RefBlock *prev = NULL;
        for (auto p = firstFree; p; p = p->nextFree) {
            auto vt = p->vtable;
            if (!(vt & 2))
                oops(43);
            int left = (vt >> 2) - numwords;
            if (left >= 0) {
                auto nf = (RefBlock *)((void **)p + numwords);
                if (left)
                    nf->vtable = (left << 2) | 2;
                if (left >= 2) {
                    nf->nextFree = p->nextFree;
                } else {
                    nf = p->nextFree;
                }
                if (prev)
                    prev->nextFree = nf;
                else
                    firstFree = nf;
                p->vtable = 0;
                return p;
            }
            prev = p;
        }

        // we didn't find anything, try GC
        if (i == 0)
            gc();
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

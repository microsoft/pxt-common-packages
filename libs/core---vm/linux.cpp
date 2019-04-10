#include "pxt.h"

#include <stdlib.h>
#include <stdio.h>
#include <sys/time.h>
#include <time.h>
#include <unistd.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/mman.h>
#include <errno.h>

// should this be something like CXX11 or whatever?
#define THROW throw()
#define THREAD_DBG(...)

void *xmalloc(size_t sz) {
    auto r = malloc(sz);
    if (r == NULL)
        oops(50); // shouldn't happen
    return r;
}

void *operator new(size_t size) {
    return xmalloc(size);
}
void *operator new[](size_t size) {
    return xmalloc(size);
}

void operator delete(void *p)THROW {
    xfree(p);
}
void operator delete[](void *p) THROW {
    xfree(p);
}

namespace pxt {

static uint64_t startTime;

FiberContext *allFibers;
FiberContext *currentFiber;

static struct Event *eventHead, *eventTail;

struct Event {
    struct Event *next;
    int source;
    int value;
};

Event lastEvent;

Event *mkEvent(int source, int value) {
    auto res = new Event();
    memset(res, 0, sizeof(Event));
    res->source = source;
    res->value = value;
    return res;
}

volatile bool paniced;
extern "C" void drawPanic(int code);

extern "C" void target_panic(int error_code) {
    char buf[50];
    int prevErr = errno;

    paniced = true;

    snprintf(buf, sizeof(buf), "\nPANIC %d\n", error_code);

    drawPanic(error_code);
    DMESG("PANIC %d", error_code);
    DMESG("errno=%d %s", prevErr, strerror(prevErr));

    for (int i = 0; i < 10; ++i) {
        sendSerial(buf, strlen(buf));
        sleep_core_us(500 * 1000);
    }

    target_exit();
}

void sleep_core_us(uint64_t us) {
    struct timespec ts;
    ts.tv_sec = us / 1000000;
    ts.tv_nsec = (us % 1000000) * 1000;
    while (nanosleep(&ts, &ts))
        ;
}

void sleep_ms(uint32_t ms) {
    currentFiber->wakeTime = current_time_ms() + ms;
    schedule();
}

void sleep_us(uint64_t us) {
    if (us > 50000) {
        sleep_ms(us / 1000);
    } else {
        sleep_core_us(us);
    }
}

uint64_t currTime() {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec * 1000000LL + tv.tv_usec;
}

uint64_t current_time_us() {
    return currTime() - startTime;
}

int current_time_ms() {
    return current_time_us() / 1000;
}

void disposeThread(FiberContext *t) {
    if (allThreads == t) {
        allThreads = t->next;
    } else {
        for (auto tt = allThreads; tt; tt = tt->next) {
            if (tt->next == t) {
                tt->next = t->next;
                break;
            }
        }
    }
    unregisterGC(&t->act, 4);
    decr(t->act);
    decr(t->arg0);
    decr(t->data0);
    decr(t->data1);
    pthread_cond_destroy(&t->waitCond);
    delete t;
}

void setupThread(Action a, TValue arg = 0) {
    // TODO
}

void runInParallel(Action a) {
    setupThread(a);
}

void runForever(Action a) {
    // TODO
    target_panic(999);
}

void waitForEvent(int source, int value) {
    currentFiber->wakeSource = source;
    currentFiber->wakeValue = value;
    schedule();
}

static void dispatchEvent(Event &e) {
    lastEvent = e;

    auto curr = findBinding(e.source, e.value);
    if (curr)
        setupThread(curr->action, fromInt(e.value));

    curr = findBinding(e.source, DEVICE_EVT_ANY);
    if (curr)
        setupThread(curr->action, fromInt(e.value));
}

static void wakeFibers() {
    while (eventHead != NULL) {
        if (paniced)
            return 0;
        Event *ev = eventHead;
        eventHead = ev->next;
        if (eventHead == NULL)
            eventTail = NULL;

        for (auto thr = allFibers; thr; thr = thr->next) {
            if (paniced)
                return 0;
            if (thr->waitSource == 0)
                continue;
            if (thr->waitValue != ev->value && thr->waitValue != DEVICE_EVT_ANY)
                continue;
            if (thr->waitSource == ev->source) {
                thr->waitSource = 0;
            } else if (thr->waitSource == DEVICE_ID_NOTIFY && ev->source == DEVICE_ID_NOTIFY_ONE) {
                thr->waitSource = 0;
                break; // do not wake up any other threads
            }
        }

        dispatchEvent(*ev);
        delete ev;
    }
}

void schedule() {
    auto f = currentFiber;
    if (!f->wakeTime && !f->waitSource)
        oops(55);
    f->resumePC = f->pc;
    f->pc = NULL; // this will break the exec_loop()
}

static void mainRunLoop() {
    FiberContext *f = NULL;
    for (;;) {
        wakeFibers();
        auto now = current_time_ms();
        auto full = false;
        if (!f) {
            f = allFibers;
            full = true;
        }
        while (f) {
            if (f->wakeTime && now >= f->wakeTime)
                f->wakeTime = 0;
            if (!f->wakeTime && !f->waitSource)
                break;
            f = f->next;
        }
        if (f) {
            currentFiber = f;
            f->pc = f->resumePC;
            f->resumePC = NULL;
            exec_loop(f);
            auto n = f->next;
            if (f->resumePC == NULL) {
                if (f->foreverPC) {
                    f->resumePC = f->foreverPC;
                    f->wakeTime = current_time_ms() + 20;
                } else {
                    disposeThread(f);
                }
            }
            f = n;
        } else if (full) {
            sleep_core_us(1000);
        }
    }
}

int allocateNotifyEvent() {
    static volatile int notifyId;
    return ++notifyId;
}

void raiseEvent(int id, int event) {
    auto e = mkEvent(id, event);
    if (eventTail == NULL) {
        if (eventHead != NULL)
            oops(51);
        eventHead = eventTail = e;
    } else {
        eventTail->next = e;
        eventTail = e;
    }
}

void registerWithDal(int id, int event, Action a, int flags) {
    // TODO support flags
    setBinding(id, event, a);
}

uint32_t afterProgramPage() {
    return 0;
}

char **initialArgv;

void screen_init();
void initKeys();
void target_startup();

void initRuntime() {
    startTime = currTime();

    target_startup();

    setupThread(0);

    target_init();
    screen_init();
    initKeys();

    mainRunLoop();
}

#ifdef PXT_GC
#define GC_BASE 0x20000000
#define GC_PAGE_SIZE 4096
void *gcAllocBlock(size_t sz) {
    static uint8_t *currPtr = (uint8_t *)GC_BASE;
    sz = (sz + GC_PAGE_SIZE - 1) & ~(GC_PAGE_SIZE - 1);
    void *r = mmap(currPtr, sz, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANON, -1, 0);
    if (r == MAP_FAILED) {
        DMESG("mmap %p failed; err=%d", currPtr, errno);
        target_panic(PANIC_INTERNAL_ERROR);
    }
    currPtr = (uint8_t *)r + sz;
    if (isReadOnly((TValue)r)) {
        DMESG("mmap returned read-only address: %p", r);
        target_panic(PANIC_INTERNAL_ERROR);
    }
    return r;
}
#endif

} // namespace pxt

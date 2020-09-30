#include "pxt.h"
using namespace codal;

namespace pxt {

// ---------------------------------------------------------------------------
// An adapter for the API expected by the run-time.
// ---------------------------------------------------------------------------

// We have the invariant that if [dispatchEvent] is registered against the DAL
// for a given event, then [handlersMap] contains a valid entry for that
// event.
void dispatchEvent(Event e) {
    lastEvent = e;

    auto curr = findBinding(e.source, e.value);
    auto value = fromInt(e.value);
    while (curr) {
        runAction1(curr->action, value);
        curr = nextBinding(curr->next, e.source, e.value);
    }
}

void registerWithDal(int id, int event, Action a, int flags) {
    // first time?
    if (!findBinding(id, event)) {
        EventModel::defaultEventBus->listen(id, event, dispatchEvent, flags);
        if (event == 0) {
            // we're registering for all events on given ID
            // need to remove old listeners for specific events
            auto curr = findBinding(id, -1);
            while (curr) {
                EventModel::defaultEventBus->ignore(id, curr->value, dispatchEvent);
                curr = nextBinding(curr->next, id, -1);
            }
        }
    }
    setBinding(id, event, a);
}

void fiberDone(void *a) {
    unregisterGCPtr((Action)a);
    release_fiber();
}

void releaseFiber() {
    release_fiber();
}

void sleep_ms(unsigned ms) {
    fiber_sleep(ms);
}

void sleep_us(uint64_t us) {
    target_wait_us(us);
}

void forever_stub(void *a) {
    while (true) {
        runAction0((Action)a);
        fiber_sleep(20);
    }
}

void runForever(Action a) {
    if (a != 0) {
        registerGCPtr(a);
        create_fiber(forever_stub, (void *)a);
    }
}

void runInParallel(Action a) {
    if (a != 0) {
        registerGCPtr(a);
        create_fiber((void (*)(void *))runAction0, (void *)a, fiberDone);
    }
}

void waitForEvent(int id, int event) {
    fiber_wait_for_event(id, event);
}

//%
unsigned afterProgramPage() {
    unsigned ptr = (unsigned)&bytecode[0];
    ptr += programSize();
    ptr = (ptr + (PAGE_SIZE - 1)) & ~(PAGE_SIZE - 1);
    return ptr;
}

uint64_t getLongSerialNumber() {
    return target_get_serial();
}

int current_time_ms() {
    return system_timer_current_time();
}

uint64_t current_time_us() {
    return system_timer_current_time_us();
}

ThreadContext *getThreadContext() {
    if (!currentFiber)
        return NULL;
    return (ThreadContext *)currentFiber->user_data;
}

void setThreadContext(ThreadContext *ctx) {
    currentFiber->user_data = ctx;
}

static void *threadAddressFor(codal::Fiber *fib, void *sp) {
    if (fib == currentFiber)
        return sp;
    return (uint8_t *)sp + ((uint8_t *)fib->stack_top - (uint8_t *)tcb_get_stack_base(fib->tcb));
}

void gcProcessStacks(int flags) {
    // check scheduler is initialized
    if (!currentFiber) {
        // make sure we allocate something to at least initalize the memory allocator
        void *volatile p = xmalloc(1);
        xfree(p);
        return;
    }

    int numFibers = codal::list_fibers(NULL);
    codal::Fiber **fibers = (codal::Fiber **)xmalloc(sizeof(codal::Fiber *) * numFibers);
    int num2 = codal::list_fibers(fibers);
    if (numFibers != num2)
        oops(12);
    int cnt = 0;

    for (int i = 0; i < numFibers; ++i) {
        auto fib = fibers[i];
        auto ctx = (ThreadContext *)fib->user_data;
        if (!ctx)
            continue;
        gcProcess(ctx->thrownValue);
        for (auto seg = &ctx->stack; seg; seg = seg->next) {
            auto ptr = (TValue *)threadAddressFor(fib, seg->top);
            auto end = (TValue *)threadAddressFor(fib, seg->bottom);
            if (flags & 2)
                DMESG("RS%d:%p/%d", cnt++, ptr, end - ptr);
            // VLOG("mark: %p - %p", ptr, end);
            while (ptr < end) {
                gcProcess(*ptr++);
            }
        }
    }
    xfree(fibers);
}

} // namespace pxt

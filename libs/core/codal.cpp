#include "pxt.h"
#include "LowLevelTimer.h"
using namespace codal;

void cpu_clock_init(void);

PXT_ABI(__aeabi_dadd)
PXT_ABI(__aeabi_dcmplt)
PXT_ABI(__aeabi_dcmpgt)
PXT_ABI(__aeabi_dsub)
PXT_ABI(__aeabi_ddiv)
PXT_ABI(__aeabi_dmul)

#define PXT_COMM_BASE 0x20001000 // 4k in

namespace pxt {

void platform_init();
void usb_init();

// The first two word are used to tell the bootloader that a single reset should start the
// bootloader and the MSD device, not us.
// The rest is reserved for partial flashing checksums.
__attribute__((section(".binmeta"))) __attribute__((used)) const uint32_t pxt_binmeta[] = {
    0x87eeb07c, 0x87eeb07c, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff,
    0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff,
};

Event lastEvent;
MessageBus devMessageBus;
codal::CodalDevice device;

struct FreeList {
    FreeList *next;
};

static void commInit() {
    int commSize = bytecode[20];
    if (!commSize)
        return;

    FreeList *head = NULL;
    void *commBase = (void *)PXT_COMM_BASE;
    for (;;) {
        void *p = xmalloc(4);
        // assume 4 byte alloc header; if we're not hitting 8 byte alignment, try allocating 8
        // bytes, not 4 without the volatile, gcc assumes 8 byte alignment on malloc()
        volatile uintptr_t hp = (uintptr_t)p;
        if (hp & 4) {
            xfree(p);
            p = xmalloc(8);
        }
        if (p == commBase) {
            xfree(p);
            // allocate the comm section; this is never freed
            p = xmalloc(commSize);
            if (p != commBase)
                oops(10);
            break;
        }
        if (p > commBase)
            oops(11);
        auto f = (FreeList *)p;
        f->next = head;
        head = f;
    }
    // free all the filler stuff
    while (head) {
        auto p = head;
        head = head->next;
        xfree(p);
    }
}

static void initCodal() {
    cpu_clock_init();

    commInit();

    // Bring up fiber scheduler.
    scheduler_init(devMessageBus);

    // We probably don't need that - components are initialized when one obtains
    // the reference to it.
    // devMessageBus.listen(DEVICE_ID_MESSAGE_BUS_LISTENER, DEVICE_EVT_ANY, this,
    // &CircuitPlayground::onListenerRegisteredEvent);

    for (int i = 0; i < DEVICE_COMPONENT_COUNT; i++) {
        if (CodalComponent::components[i])
            CodalComponent::components[i]->init();
    }

    usb_init();

    auto led = LOOKUP_PIN(LED);
    if (led) {
        led->setDigitalValue(0);
    }
}

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
        devMessageBus.listen(id, event, dispatchEvent, flags);
        if (event == 0) {
            // we're registering for all events on given ID
            // need to remove old listeners for specific events
            auto curr = findBinding(id, -1);
            while (curr) {
                devMessageBus.ignore(id, curr->value, dispatchEvent);
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

void initRuntime() {
    initSystemTimer();
    initCodal();
    platform_init();
}

//%
unsigned afterProgramPage() {
    unsigned ptr = (unsigned)&bytecode[0];
    ptr += programSize();
    ptr = (ptr + (PAGE_SIZE - 1)) & ~(PAGE_SIZE - 1);
    return ptr;
}

uint64_t getLongSerialNumber() {
    return device.getSerialNumber();
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

LowLevelTimer *getJACDACTimer() {
    static LowLevelTimer *jacdacTimer;
    if (!jacdacTimer) {
        jacdacTimer = allocateTimer();
        jacdacTimer->setIRQPriority(1);
    }
    return jacdacTimer;
}
void initSystemTimer() {
    new CODAL_TIMER(*allocateTimer());
}

} // namespace pxt

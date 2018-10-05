#include "pxt.h"

void cpu_clock_init(void);

PXT_ABI(__aeabi_dadd)
PXT_ABI(__aeabi_dcmplt)
PXT_ABI(__aeabi_dcmpgt)
PXT_ABI(__aeabi_dsub)
PXT_ABI(__aeabi_ddiv)
PXT_ABI(__aeabi_dmul)

#define PXT_COMM_BASE 0x20001000  // 4k in

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

CODAL_TIMER devTimer;
Event lastEvent;
MessageBus devMessageBus;
codal::CodalDevice device;

struct FreeList {
    FreeList *next;
};

static void commInit() {
    int commSize = bytecode[20];
    if (!commSize) return;

    FreeList *head = NULL;        
    void *commBase = (void*)PXT_COMM_BASE;
    for (;;) {
        void *p = malloc(4);
        // assume 4 byte alloc header; if we're not hitting 8 byte alignment, try allocating 8 bytes, not 4
        // without the volatile, gcc assumes 8 byte alignment on malloc()
        volatile unsigned hp = (unsigned)p;
        if (hp & 4) {
            free(p);
            p = malloc(8);
        }
        if (p == commBase) {
            free(p);
            // allocate the comm section; this is never freed
            p = malloc(commSize);
            if (p != commBase)
                target_panic(999);
            break;
        }
        if (p > commBase) 
            target_panic(999);
        auto f = (FreeList*)p;
        f->next = head;
        head = f;
    }
    // free all the filler stuff
    while (head) {
        auto p = head;
        head = head->next;
        free(p);
    }
}


void dispatchForeground(Event e, void* action) {
    lastEvent = e;
    auto value = fromInt(e.value);
    runAction1((Action)action, value);
}

void dispatchBackground(Event e, void* action) {
    lastEvent = e;
    auto value = fromInt(e.value);
    runAction1((Action)action, value);
}

void deleteListener(CodalListener *l) {
    if (l->cb_param == (void (*)(Event, void*))dispatchBackground || 
        l->cb_param == (void (*)(Event, void*))dispatchForeground)
        decr((Action)(l->cb_arg));
}

static void initCodal() {
    cpu_clock_init();

    commInit();

    // Bring up fiber scheduler.
    scheduler_init(devMessageBus);
    // register listener for deletion
    devMessageBus.setListenerDeletionCallback(deleteListener);

    // We probably don't need that - components are initialized when one obtains
    // the reference to it.
    // devMessageBus.listen(DEVICE_ID_MESSAGE_BUS_LISTENER, DEVICE_EVT_ANY, this,
    // &CircuitPlayground::onListenerRegisteredEvent);

    for (int i = 0; i < DEVICE_COMPONENT_COUNT; i++) {
        if (CodalComponent::components[i])
            CodalComponent::components[i]->init();
    }

    usb_init();
}

// ---------------------------------------------------------------------------
// An adapter for the API expected by the run-time.
// ---------------------------------------------------------------------------

static bool backgroundHandlerFlag = false;
void setBackgroundHandlerFlag() {
    backgroundHandlerFlag = true;
}

void registerWithDal(int id, int event, Action a) {
    if (!backgroundHandlerFlag) {
        devMessageBus.remove(id, event, dispatchForeground);
    }
    devMessageBus.listen(id, event, backgroundHandlerFlag ? dispatchBackground : dispatchForeground, a);
    backgroundHandlerFlag = false;
    incr((Action)a);
}

void unregisterFromDal(Action a) { 
    devMessageBus.remove(DEVICE_EVT_ANY, DEVICE_EVT_ANY, dispatchBackground, (void*) a);
}

void fiberDone(void *a) {
    decr((Action)a);
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
        incr(a);
        create_fiber(forever_stub, (void *)a);
    }
}

void runInParallel(Action a) {
    if (a != 0) {
        incr(a);
        create_fiber((void (*)(void *))runAction0, (void *)a, fiberDone);
    }
}

void waitForEvent(int id, int event) {
    fiber_wait_for_event(id, event);
}

void initRuntime() {
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

int getSerialNumber() {
    return device.getSerialNumber();
}

int current_time_ms() {
    return system_timer_current_time();
}
}

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

void initRuntime() {
    initSystemTimer();
    initCodal();
    platform_init();
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

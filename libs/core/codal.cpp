#include "pxt.h"
#include "neopixel.h"

void cpu_clock_init(void);


namespace pxt {

// The first two word are used to tell the bootloader that a single reset should start the
// bootloader and the MSD device, not us.
// The rest is reserved for partial flashing checksums.
__attribute__((section(".binmeta"))) __attribute__((used)) const uint32_t pxt_binmeta[] = {
    0x87eeb07c, 0x87eeb07c, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff,
    0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff,
};

// TODO: these make platform device assumptions - should be lifted out
CodalUSB usb;
HF2 hf2;
codal::mbed::Timer devTimer;
Event lastEvent;
MessageBus devMessageBus;
codal::CodalDevice device;

// TODO extract these from uf2_info()?
static const char *string_descriptors[] = {
    "Example Corp.", "PXT Device", "42424242",
};

static void initCodal() {
    cpu_clock_init();

    // Bring up fiber scheduler.
    scheduler_init(devMessageBus);

    // We probably don't need that - components are initialized when one obtains
    // the reference to it.
    //devMessageBus.listen(DEVICE_ID_MESSAGE_BUS_LISTENER, DEVICE_EVT_ANY, this, &CircuitPlayground::onListenerRegisteredEvent);
    
    for(int i = 0; i < DEVICE_COMPONENT_COUNT; i++) {
        if(CodalComponent::components[i])
            CodalComponent::components[i]->init();
    }
    
    usb.stringDescriptors = string_descriptors;
    usb.add(hf2);
    usb.start();
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
    if (curr)
        runAction1(curr->action, fromInt(e.value));

    curr = findBinding(e.source, DEVICE_EVT_ANY);
    if (curr)
        runAction1(curr->action, fromInt(e.value));
}

void registerWithDal(int id, int event, Action a) {
    // first time?
    if (!findBinding(id, event))
        devMessageBus.listen(id, event, dispatchEvent);
    setBinding(id, event, a);
}

void fiberDone(void *a) {
    decr((Action)a);
    release_fiber();
}

void sleep_ms(unsigned ms) {
    fiber_sleep(ms);
}

void sleep_us(uint64_t us) {
    wait_us(us);
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

void runInBackground(Action a) {
    if (a != 0) {
        incr(a);
        create_fiber((void (*)(void *))runAction0, (void *)a, fiberDone);
    }
}

void waitForEvent(int id, int event) {
    fiber_wait_for_event(id, event);
}

void initRandomSeed() {
    int seed = 0xC0DA1;
    auto pinTemp = LOOKUP_PIN(TEMPERATURE);
    if (pinTemp)
        seed *= pinTemp->getAnalogValue();
    auto pinLight = LOOKUP_PIN(LIGHT);
    if (pinLight)
        seed *= pinLight->getAnalogValue();
    seedRandom(seed);
}

void clearNeoPixels() {
    // clear on-board neopixels
    auto neoPin = LOOKUP_PIN(NEOPIXEL);
    if (neoPin) {
        uint8_t neobuf[30];
        memset(neobuf, 0, 30);
        neoPin->setDigitalValue(0);
        fiber_sleep(1);
        neopixel_send_buffer(*neoPin, neobuf, 30);
    }
}

void initRuntime() {
    initCodal();
    initRandomSeed();
    clearNeoPixels();

    if (*HF2_DBG_MAGIC_PTR == HF2_DBG_MAGIC_START) {
        *HF2_DBG_MAGIC_PTR = 0;
        // this will cause alignment fault at the first breakpoint
        globals[0] = (TValue)1;
    }
}

//%
unsigned afterProgramPage() {
    unsigned ptr = (unsigned)&bytecode[0];
    ptr += programSize();
    ptr = (ptr + (PAGE_SIZE - 1)) & ~(PAGE_SIZE - 1);
    return ptr;
}

void dumpDmesg() {
    hf2.sendSerial("\nDMESG:\n", 8);
    hf2.sendSerial(codalLogStore.buffer, codalLogStore.ptr);
    hf2.sendSerial("\n\n", 2);
}

void sendSerial(const char *data, int len) {
    hf2.sendSerial(data, len);
}

int getSerialNumber() {
    return device.getSerialNumber();
}

int current_time_ms() {
    return system_timer_current_time();
}
}

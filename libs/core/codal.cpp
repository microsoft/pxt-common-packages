#include "pxt.h"
#include "neopixel.h"

CodalDevice device;

namespace pxt {


// The first two word are used to tell the bootloader that a single reset should start the
// bootloader and the MSD device, not us.
// The rest is reserved for partial flashing checksums.
__attribute__((section(".binmeta"))) __attribute__((used)) const uint32_t pxt_binmeta[] = {
    0x87eeb07c, 0x87eeb07c, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff,
    0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff,
    0x00ff00ff, 0x00ff00ff,
};



CodalUSB usb;
HF2 hf2;

// TODO extract these from uf2_info()?
static const char *string_descriptors[] = {
    "Example Corp.", "PXT Device", "42424242",
};

static void initCodal() {
    devTimer.init();

    // Bring up fiber scheduler.
    scheduler_init(devMessageBus);

    // Seed our random number generator
    // seedRandom();

    // Create an event handler to trap any handlers being created for I2C services.
    // We do this to enable initialisation of those services only when they're used,
    // which saves processor time, memeory and battery life.
    // messageBus.listen(MICROBIT_ID_MESSAGE_BUS_LISTENER, MICROBIT_EVT_ANY, this,
    // &MicroBit::onListenerRegisteredEvent);

    io = new DevPins();

    usb.stringDescriptors = string_descriptors;
    usb.add(hf2);
    usb.start();
}

// ---------------------------------------------------------------------------
// An adapter for the API expected by the run-time.
// ---------------------------------------------------------------------------

map<pair<int, int>, Action> handlersMap;

Event lastEvent;
codal::mbed::Timer devTimer;
MessageBus devMessageBus;
codal::CodalDevice device;

// We have the invariant that if [dispatchEvent] is registered against the DAL
// for a given event, then [handlersMap] contains a valid entry for that
// event.
void dispatchEvent(Event e) {
    lastEvent = e;

    Action curr = handlersMap[{e.source, e.value}];
    if (curr)
        runAction1(curr, fromInt(e.value));

    curr = handlersMap[{e.source, DEVICE_EVT_ANY}];
    if (curr)
        runAction1(curr, fromInt(e.value));
}

void registerWithDal(int id, int event, Action a) {
    Action prev = handlersMap[{id, event}];
    if (prev)
        decr(prev);
    else
        devMessageBus.listen(id, event, dispatchEvent);
    incr(a);
    handlersMap[{id, event}] = a;
}

void fiberDone(void *a) {
    decr((Action)a);
    release_fiber();
}

void runInBackground(Action a) {
    if (a != 0) {
        incr(a);
        create_fiber((void (*)(void *))runAction0, (void *)a, fiberDone);
    }
}

void waitForEvent(int id, int event)
{
    fiber_wait_for_event(id, event);
}

void initRandomSeed() {
    int seed = 0xC0DA1;
    auto pinTemp = lookupPin(PIN_TEMPERATURE);
    if (pinTemp)
        seed *= pinTemp->getAnalogValue();
    auto pinLight = lookupPin(PIN_LIGHT);
    if (pinLight)
        seed *= pinLight->getAnalogValue();
    device.seedRandom(seed);
}

void clearNeoPixels() {
    // clear on-board neopixels
    auto neoPin = lookupPin(PIN_NEOPIXEL);
    if (neoPin) {
        uint8_t neobuf[30];
        memset(neobuf, 0, 30);
        neoPin->setDigitalValue(0);
        fiber_sleep(1);
        neopixel_send_buffer(*neoPin, neobuf, 30);
    }
}


}

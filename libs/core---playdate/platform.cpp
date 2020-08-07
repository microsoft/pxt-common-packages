#include "pxt.h"

namespace pxt {

Event lastEvent;

//%
void deepSleep() {}

void sendSerial(const char *data, int len) {
    playdate->system->logToConsole((char *)"%s", data);
}

void platform_init() {}

int *getBootloaderConfigData() {
    return NULL;
}

void initRuntime() {
    DMESG("about to start TS code...");
}

void dumpDmesg() {
    sendSerial("\nDMESG:\n", 8);
    sendSerial(codalLogStore.buffer, codalLogStore.ptr);
    sendSerial("\n\n", 2);
}

uint32_t updateKeyEvents();
uintptr_t programEnd;

} // namespace pxt

void cpu_clock_init() {}

void *xmalloc(size_t sz) {
    auto r = malloc(sz);
    if (r == NULL)
        target_panic(22);
    return r;
}

PlaydateAPI *playdate = NULL;
void codal_update();

static int update(void *ud) {
    uint32_t btnstate = pxt::updateKeyEvents();

     btnstate = 1; // comment out to wait for key on start

    static int started;
    if (started || btnstate) {
        if (!started) {
            programEnd = (uintptr_t)malloc(1);
            DMESG("progend: %p", programEnd);
        }
        codal_update();
        if (!started) {
            started = 1;
            DMESG("startup");
            codal::create_fiber(pxt::start);
        }
    }

    playdate->system->drawFPS(330, 10);

    return 1;
}

extern "C" int eventHandler(PlaydateAPI *playdate_, PDSystemEvent event, uint32_t arg) {
    // it doesn't seem the key events are rised

    DMESG("event: %d / %d", event, arg);

    if (event == kEventInit) {
        playdate = playdate_;

        playdate->display->setRefreshRate(20);
        playdate->system->setUpdateCallback(update, NULL);
    }

    return 0;
}

namespace control {
/**
 * Determines if the USB has been enumerated.
 */
//%
bool isUSBInitialized() {
    return false;
}
} // namespace control
#include "pxt.h"
#include <pthread.h>

namespace codal {
void CodalComponent::addComponent() {}
void CodalComponent::removeComponent() {}

struct Fiber;

Fiber *create_fiber(void (*entry_fn)(void *), void *param, void (*completion_fn)(void *)) {
    // shouldn't be called
    target_panic(999);
    return NULL;
}

void release_fiber(void *) {}

uint16_t allocateNotifyEvent() {
    return pxt::allocateNotifyEvent();
}

Event::Event() {}

Event::Event(uint16_t source, uint16_t value, EventLaunchMode mode) {
    if (mode != CREATE_ONLY) {
        pxt::raiseEvent(source, value);
    }
}

void fiber_sleep(unsigned long ms) {
    sleep_ms(ms);
}

static uint16_t wake_source, wake_value;
void fiber_wake_on_event(uint16_t source, uint16_t value) {
    wake_source = source;
    wake_value = value;
}


void schedule() {
    pxt::waitForEvent(wake_source, wake_value);
}

extern "C" void codal_dmesg(const char *format, ...)
{
    va_list arg;
    va_start(arg, format);
    vdmesg(format, arg);
    va_end(arg);
}


} // namespace codal

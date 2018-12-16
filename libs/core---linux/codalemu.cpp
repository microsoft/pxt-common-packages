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

void fiber_wake_on_event(unsigned short, unsigned short) {
    // shouldn't be called
    target_panic(998);
}


void schedule() {
    // shouldn't be called
    target_panic(998);
}

} // namespace codal

#pragma once

namespace codal {
static inline uint16_t allocateNotifyEvent() {
    static uint16_t userNotifyId = 1;
    return userNotifyId++;
}
}

#include "pxt.h"
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <stdarg.h>
#include <fcntl.h>

#include "esp_log.h"

// make sure compiler doesn't optimize accesses to PXT_EXPORTData in vmload.cpp by placing
// it in different file (this one)
// also this is rewritten by pxt; don't rely on values here
#define PXT_EXPORT(p) (uintptr_t)(void *)(p)
extern "C" {
__attribute__((used)) __attribute__((aligned(0x20))) const uintptr_t PXT_EXPORTData[] = {
    0x08010801,
    0x42424242,
    0x08010801,
    0x8de9d83e,
    PXT_EXPORT(&pxt::buffer_vt),
    PXT_EXPORT(&pxt::number_vt),
    PXT_EXPORT(&pxt::RefAction_vtable),
    PXT_EXPORT(&pxt::string_inline_ascii_vt),
    PXT_EXPORT(&pxt::string_skiplist16_packed_vt),
    PXT_EXPORT(&pxt::string_inline_utf8_vt),
    PXT_EXPORT(pxt::RefRecord_destroy),
    PXT_EXPORT(pxt::RefRecord_print),
    PXT_EXPORT(pxt::RefRecord_scan),
    PXT_EXPORT(pxt::RefRecord_gcsize),
    PXT_EXPORT(0),
};
}

namespace pxt {

worker_t fg_worker;

void target_exit() {
    systemReset();
}

extern "C" void target_reset() {
    esp_restart();
}

void ets_log_dmesg();
static void fg_worker_idle(void *) {
    ets_log_dmesg();
}

void target_startup() {
    fg_worker = worker_alloc("pxt_fg", 2048);
    worker_set_idle(fg_worker, fg_worker_idle, NULL);
}

uint64_t getLongSerialNumber() {
    static uint64_t addr;
    if (!addr) {
        uint8_t mac[6];
        esp_efuse_mac_get_default(mac);
        addr = ((uint64_t)0xff << 56) | ((uint64_t)mac[5] << 48) | ((uint64_t)mac[4] << 40) |
               ((uint64_t)mac[3] << 32) | ((uint64_t)mac[2] << 24) | ((uint64_t)mac[1] << 16) |
               ((uint64_t)mac[0] << 8) | ((uint64_t)0xfe << 0);
    }
    return addr;
}

void deepSleep() {
    // nothing to do
}

uint64_t current_time_us() {
    static uint64_t start_time;
    if (!start_time) {
        // try to synchronize with log timestamp
        start_time = esp_timer_get_time() - esp_log_timestamp() * 1000;
    }
    return esp_timer_get_time() - start_time;
}

} // namespace pxt

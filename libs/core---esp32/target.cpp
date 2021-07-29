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
    return 0;
}

void deepSleep() {
    // nothing to do
}

} // namespace pxt

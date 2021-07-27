#include "pxt.h"

IRAM_ATTR void target_wait_us(uint32_t us) {
    int64_t later = esp_timer_get_time() + us;
    while (esp_timer_get_time() < later) {
        ;
    }
}

static portMUX_TYPE global_int_mux = portMUX_INITIALIZER_UNLOCKED;

IRAM_ATTR void target_disable_irq() {
    vPortEnterCritical(&global_int_mux);
}

IRAM_ATTR void target_enable_irq() {
    vPortExitCritical(&global_int_mux);
}

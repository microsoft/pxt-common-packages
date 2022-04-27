#include "pxt.h"

IRAM_ATTR void target_wait_us(uint32_t us) {
    int64_t later = esp_timer_get_time() + us;
    while (esp_timer_get_time() < later) {
        ;
    }
}

static portMUX_TYPE global_int_mux = portMUX_INITIALIZER_UNLOCKED;
int int_level;

IRAM_ATTR void target_disable_irq() {
    vPortEnterCritical(&global_int_mux);
    int_level++;
}

IRAM_ATTR void target_enable_irq() {
    int_level--;
    vPortExitCritical(&global_int_mux);
}

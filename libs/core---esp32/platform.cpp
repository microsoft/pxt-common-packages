#include "pxt.h"

#include "esp_system.h"
#include "esp_log.h"
#include "driver/gpio.h"
#include "esp_private/system_internal.h"

void reboot_to_uf2(void) {
#if CONFIG_IDF_TARGET_ESP32S2
    // call esp_reset_reason() is required for idf.py to properly links esp_reset_reason_set_hint()
    (void)esp_reset_reason();
    esp_reset_reason_set_hint((esp_reset_reason_t)0x11F2);
#endif
    esp_restart();
}

namespace pxt {

static void initRandomSeed() {
    seedRandom(esp_random());
}

void sendSerial(const char *data, int len) {
    ets_printf(LOG_BOLD(LOG_COLOR_PURPLE) "%s" LOG_RESET_COLOR "\n", data);
}

extern "C" void drawPanic(int code) {
    // TODO
}

#if CONFIG_IDF_TARGET_ESP32S2
static void bootloader_handler(void *) {
    reboot_to_uf2();
}

static void install_gpio0_handler() {
    gpio_config_t gpio_conf;
    gpio_conf.intr_type = GPIO_INTR_POSEDGE;
    gpio_conf.mode = GPIO_MODE_INPUT;
    gpio_conf.pin_bit_mask = (1ULL << GPIO_NUM_0);
    gpio_conf.pull_down_en = GPIO_PULLDOWN_DISABLE;
    gpio_conf.pull_up_en = GPIO_PULLUP_ENABLE;
    gpio_config(&gpio_conf);
    gpio_isr_handler_add(GPIO_NUM_0, bootloader_handler, NULL);
}
#endif

extern "C" void target_init() {
    DMESG("reset reason: %x", esp_reset_reason_get_hint());
    initRandomSeed();
    gpio_install_isr_service(0);
#if CONFIG_IDF_TARGET_ESP32S2
    install_gpio0_handler();
#endif
    memInfo();
}

void updateScreen(Image_ img);

void screen_init() {
    updateScreen(NULL);
}

void memInfo() {
    // heap_caps_print_heap_info(MALLOC_CAP_DEFAULT);
    DMESG("mem: %d free (%d total)", heap_caps_get_free_size(MALLOC_CAP_DEFAULT),
          heap_caps_get_total_size(MALLOC_CAP_DEFAULT));
}

} // namespace pxt

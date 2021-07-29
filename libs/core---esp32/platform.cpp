#include "pxt.h"

#include "esp_system.h"
#include "esp_log.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_private/system_internal.h"

#define CHK(call)                                                                                  \
    {                                                                                              \
        int __r = call;                                                                            \
        if (__r != 0) {                                                                            \
            DMESG("fail: %d at %d", __r, __LINE__);                                                \
            abort();                                                                               \
        }                                                                                          \
    }

static void reset_pin(PinName p) {
    if (p != -1)
        gpio_set_direction((gpio_num_t)p, GPIO_MODE_DISABLE);
}

void reboot_to_uf2(void) {
    reset_pin(PIN(LED_R));
    reset_pin(PIN(LED_G));
    reset_pin(PIN(LED_B));

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
    ets_printf(LOG_BOLD(LOG_COLOR_PURPLE) "%s" LOG_RESET_COLOR, data);
}

extern "C" void drawPanic(int code) {
    // TODO
}

#if CONFIG_IDF_TARGET_ESP32S2
static void bootloader_handler(void *) {
    reboot_to_uf2();
}

void install_gpio0_handler() {
    DMESG("reset reason: %x", esp_reset_reason_get_hint());
    gpio_install_isr_service(0);
    gpio_config_t gpio_conf;
    gpio_conf.intr_type = GPIO_INTR_POSEDGE;
    gpio_conf.mode = GPIO_MODE_INPUT;
    gpio_conf.pin_bit_mask = (1ULL << GPIO_NUM_0);
    gpio_conf.pull_down_en = GPIO_PULLDOWN_DISABLE;
    gpio_conf.pull_up_en = GPIO_PULLUP_ENABLE;
    gpio_config(&gpio_conf);
    gpio_isr_handler_add(GPIO_NUM_0, bootloader_handler, NULL);
}
#else
void install_gpio0_handler() {
    gpio_install_isr_service(0);
}
#endif

extern "C" void target_init() {
    initRandomSeed();
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

void (*logJDFrame)(const uint8_t *data);
void (*sendJDFrame)(const uint8_t *data);

} // namespace pxt

#include "driver/ledc.h"

namespace _light {

static void config_channel(ledc_channel_t ch, int pin) {
    ledc_channel_config_t cfg;
    memset(&cfg, 0, sizeof(cfg));
    cfg.channel = ch;
    cfg.gpio_num = pin;
    cfg.timer_sel = LEDC_TIMER_1;
    cfg.speed_mode = LEDC_LOW_SPEED_MODE;
    cfg.duty = 1024;
    CHK(ledc_channel_config(&cfg));
}

// do not expose for now - this will probably conflict with regular Pin APIs
/**
 * Set the color of the built-in status LED
 */
void setStatusLed(uint32_t color) {
    static bool inited;
    if (PIN(LED_R) == -1)
        return;

    if (!inited) {
        inited = true;
        ledc_fade_func_install(0);

        ledc_timer_config_t ledc_timer;
        memset(&ledc_timer, 0, sizeof(ledc_timer));
        ledc_timer.duty_resolution = LEDC_TIMER_10_BIT;
        ledc_timer.freq_hz = 50;
        ledc_timer.speed_mode = LEDC_LOW_SPEED_MODE;
        ledc_timer.timer_num = LEDC_TIMER_1;
        ledc_timer.clk_cfg = LEDC_AUTO_CLK;
        CHK(ledc_timer_config(&ledc_timer));

        config_channel(LEDC_CHANNEL_0, PIN(LED_R));
        config_channel(LEDC_CHANNEL_1, PIN(LED_G));
        config_channel(LEDC_CHANNEL_2, PIN(LED_B));
    };

    for (int i = 0; i < 3; ++i) {
        CHK(ledc_set_duty_with_hpoint(LEDC_LOW_SPEED_MODE, (ledc_channel_t)(LEDC_CHANNEL_0 + i),
                                      1024 - (((color >> (16 - i * 8)) & 0xff) << 2), 0));
        CHK(ledc_update_duty(LEDC_LOW_SPEED_MODE, (ledc_channel_t)(LEDC_CHANNEL_0 + i)));
    }
}
} // namespace _light

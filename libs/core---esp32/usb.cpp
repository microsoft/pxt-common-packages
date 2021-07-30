#include "dmesg.h"
#include "tinyusb.h"
#include "tusb_cdc_acm.h"

#define LOG(msg, ...) DMESG("USB: " msg, ##__VA_ARGS__)

static uint8_t buf[CONFIG_USB_CDC_RX_BUFSIZE + 1];


static const char *descriptor_str[USB_STRING_DESCRIPTOR_ARRAY_SIZE] = {
    // array of pointer to string descriptors
    (char[]){0x09, 0x04},                // 0: is supported language is English (0x0409)
    CONFIG_USB_DESC_MANUFACTURER_STRING, // 1: Manufacturer
    "PXT Device (app)",                  // 2: Product
    "",                                  // 3: Serials -> replaced

#if CONFIG_USB_CDC_ENABLED
    CONFIG_USB_DESC_CDC_STRING, // 4: CDC Interface
#else
    "",
#endif

#if CONFIG_USB_MSC_ENABLED
    CONFIG_USB_DESC_MSC_STRING, // 5: MSC Interface
#else
    "",
#endif

#if CONFIG_USB_HID_ENABLED
    CONFIG_USB_DESC_HID_STRING // 6: HIDs
#else
    "",
#endif
};

static void on_cdc_rx(int itf0, cdcacm_event_t *event) {
    /* initialization */
    size_t rx_size = 0;
    tinyusb_cdcacm_itf_t itf = (tinyusb_cdcacm_itf_t)itf0;

    /* read */
    esp_err_t ret = tinyusb_cdcacm_read(itf, buf, CONFIG_USB_CDC_RX_BUFSIZE, &rx_size);
    if (ret == ESP_OK) {
        buf[rx_size] = '\0';
        LOG("Got data (%d bytes): %s", rx_size, buf);
    } else {
        LOG("Read error");
    }

    /* write back */
    tinyusb_cdcacm_write_queue(itf, buf, rx_size);
    tinyusb_cdcacm_write_queue(itf, buf, rx_size);
    tinyusb_cdcacm_write_flush(itf, 0);
}

static void on_cdc_line_state_changed(int itf, cdcacm_event_t *event) {
    int dtr = event->line_state_changed_data.dtr;
    int rst = event->line_state_changed_data.rts;
    LOG("Line state changed! dtr:%d, rst:%d", dtr, rst);
}

extern "C" void usb_init() {
    LOG("init");
    tinyusb_config_t tusb_cfg;
    memset(&tusb_cfg, 0, sizeof(tusb_cfg));

    uint8_t mac[6];
    esp_efuse_mac_get_default(mac);
    static char macHex[15];
    macHex[0] = 'P';
    macHex[1] = 'X';
    for (int i = 0; i < 6; ++i) {
        snprintf(macHex + (2 + i * 2), 3, "%02X", mac[i]);
    }
    DMESG("USB serial: %s", macHex);
    descriptor_str[3] = macHex;
    tusb_cfg.string_descriptor = (char**)descriptor_str;

    ESP_ERROR_CHECK(tinyusb_driver_install(&tusb_cfg));

    tinyusb_config_cdcacm_t amc_cfg;
    memset(&amc_cfg, 0, sizeof(amc_cfg));
    amc_cfg.usb_dev = TINYUSB_USBDEV_0;
    amc_cfg.cdc_port = TINYUSB_CDC_ACM_0;
    amc_cfg.rx_unread_buf_sz = 64;
    amc_cfg.callback_rx = &on_cdc_rx;
    amc_cfg.callback_line_state_changed = &on_cdc_line_state_changed;
    ESP_ERROR_CHECK(tusb_cdc_acm_init(&amc_cfg));

    LOG("init done");
}

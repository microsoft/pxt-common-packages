#include "pxt.h"

#include "freertos/event_groups.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "esp_netif.h"

#define TAG "wifi"
#define LOG(...) ESP_LOGI(TAG, __VA_ARGS__)
#define WIFI_ID 1234

void settings_init(void);

#if 0

static void do_connect(void *cfg_) {
    wifi_config_t *cfg = cfg_;

}

static void wifi_cmd_disconnect(void *arg) {
    disconnect();
    jd_send(wifi_state->service_number, JD_WIFI_CMD_DISCONNECT, NULL, 0);
}

static int wifi_cmd_sta_join(jd_packet_t *pkt) {

    worker_run(worker, do_connect, cfg);

    return true;
}

#endif

namespace _wifi {

enum class WifiEvent {
    //%
    ScanDone = 1,
    //%
    GotIP = 2,
    //%
    Disconnected = 3,
};

/** Get ID used in events. */
//%
int eventID() {
    return WIFI_ID;
}

static bool scan_done, reconnect, is_connected;

static void raiseWifiEvent(WifiEvent e) {
    raiseEvent(eventID(), (int)e);
}

static void scan_done_handler(void *arg, esp_event_base_t event_base, int32_t event_id,
                              void *event_data) {
    scan_done = true;
    raiseWifiEvent(WifiEvent::ScanDone);
}

static void disconnect_handler(void *arg, esp_event_base_t event_base, int32_t event_id,
                               void *event_data) {
    is_connected = false;
    if (reconnect) {
        LOG("sta disconnect, reconnect...");
        esp_wifi_connect();
    } else {
        LOG("sta disconnect");
    }
    raiseWifiEvent(WifiEvent::Disconnected);
}

static void got_ip_handler(void *arg, esp_event_base_t event_base, int32_t event_id,
                           void *event_data) {
    is_connected = true;
    raiseWifiEvent(WifiEvent::GotIP);
}

static void init() {
    static bool initialized = false;

    if (initialized)
        return;

    esp_log_level_set(TAG, ESP_LOG_INFO);

    settings_init();

    ESP_ERROR_CHECK(esp_event_loop_create_default());
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_netif_init();
    esp_netif_config_t netif_config = ESP_NETIF_DEFAULT_WIFI_STA();
    esp_netif_t *netif = esp_netif_new(&netif_config);
    assert(netif);
    esp_netif_attach_wifi_station(netif);
    esp_wifi_set_default_wifi_sta_handlers();

    ESP_ERROR_CHECK(
        esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_SCAN_DONE, &scan_done_handler, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_DISCONNECTED,
                                               &disconnect_handler, NULL));
    ESP_ERROR_CHECK(
        esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &got_ip_handler, NULL));
    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    // ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_NULL));
    ESP_ERROR_CHECK(esp_wifi_start());
    initialized = true;
}

/** Start a WiFi network scan. */
//%
void scanStart() {
    init();
    scan_done = false;
    wifi_scan_config_t scan_config;
    memset(&scan_config, 0, sizeof(scan_config));
    esp_err_t err = esp_wifi_scan_start(&scan_config, false);
    LOG("scan start: %d", err);
}

/** Get the results of the scan if any. */
//%
Buffer scanResults() {
    if (!scan_done) {
        DMESG("scan not finished");
        return NULL;
    }

    scan_done = false;

    uint16_t sta_number = 0;
    uint8_t i;
    wifi_ap_record_t *ap_list_buffer;

    esp_wifi_scan_get_ap_num(&sta_number);
    ap_list_buffer = (wifi_ap_record_t *)malloc(sta_number * sizeof(wifi_ap_record_t));

    Buffer res = NULL;

    esp_err_t err = esp_wifi_scan_get_ap_records(&sta_number, ap_list_buffer);

    if (err == ESP_OK) {
        int buffer_size = 0;
        for (i = 0; i < sta_number; i++) {
            wifi_ap_record_t *src = &ap_list_buffer[i];

            LOG("[%s][rssi=%d]", src->ssid, src->rssi);

            buffer_size += strlen((const char *)src->ssid) + 3;
        }

        res = mkBuffer(NULL, buffer_size);
        auto dst = res->data;

        for (i = 0; i < sta_number; i++) {
            wifi_ap_record_t *src = &ap_list_buffer[i];

            *dst++ = src->rssi;
            *dst++ = src->authmode;
            int len = strlen((const char *)src->ssid);
            memcpy(dst, src->ssid, len);
            dst += len;
            *dst++ = 0;
        }

        if (dst - res->data != buffer_size)
            abort();
    } else {
        DMESG("failed to read scan results: %d", err);
    }

    free(ap_list_buffer);

    return res;
}

/** Initiate connection. */
//%
int connect(String ssid, String pass) {
    wifi_config_t cfg;
    memset(&cfg,0,sizeof(cfg));
    strlcpy((char *)cfg.sta.ssid, ssid->getUTF8Data(), sizeof(cfg.sta.ssid));
    strlcpy((char *)cfg.sta.password, pass->getUTF8Data(), sizeof(cfg.sta.password));

    if (is_connected)
        return -1;

    reconnect = true;
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &cfg));
    ESP_ERROR_CHECK(esp_wifi_connect());

    return 0;
}

/** Initiate disconnection. */
//%
int disconnect() {
    reconnect = false;
    if (!is_connected)
        return -1;
    ESP_ERROR_CHECK(esp_wifi_disconnect());
    return 0;
}

/** Check if connected. */
//%
bool isConnected() {
    return is_connected;
}


} // namespace _wifi
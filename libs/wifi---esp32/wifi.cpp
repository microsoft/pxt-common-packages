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

const int CONNECTED_BIT = BIT0;
const int DISCONNECTED_BIT = BIT1;

struct srv_state {
    SRV_COMMON;
};

static srv_t *wifi_state;

static bool reconnect = true;

static EventGroupHandle_t wifi_event_group;
static opipe_desc_t scan_stream;
static worker_t worker;

static void wifi_cmd_scan(jd_packet_t *pkt) {
    wifi_scan_config_t scan_config = {0};

    if (opipe_open(&scan_stream, pkt) < 0)
        return;

    ESP_ERROR_CHECK(esp_wifi_scan_start(&scan_config, false));
}

#define JD_WIFI_SCAN_ENTRY_HEADER_SIZE (uint32_t)(&((jd_wifi_results_t *)0)->ssid)

static void disconnect_handler(void *arg, esp_event_base_t event_base, int32_t event_id,
                               void *event_data) {
    if (reconnect) {
        LOG("sta disconnect, reconnect...");
        esp_wifi_connect();
    } else {
        LOG("sta disconnect");
    }
    xEventGroupClearBits(wifi_event_group, CONNECTED_BIT);
    xEventGroupSetBits(wifi_event_group, DISCONNECTED_BIT);
    jd_send_event(wifi_state, JD_WIFI_EV_LOST_IP);
}

static void disconnect(void) {
    reconnect = false;
    xEventGroupClearBits(wifi_event_group, CONNECTED_BIT);
    ESP_ERROR_CHECK(esp_wifi_disconnect());
    xEventGroupWaitBits(wifi_event_group, DISCONNECTED_BIT, 0, 1, 5000 / portTICK_RATE_MS);
}

static void do_connect(void *cfg_) {
    wifi_config_t *cfg = cfg_;

    int bits = xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, 0, 1, 0);
    if (bits & CONNECTED_BIT)
        disconnect();

    reconnect = true;
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, cfg));
    ESP_ERROR_CHECK(esp_wifi_connect());

    LOG("waiting for connection");

    free(cfg);

    bits = xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, 0, 1, 15000 / portTICK_RATE_MS);

    LOG("waited conn=%d", (bits & CONNECTED_BIT) != 0);

    // do we need this?
    if (bits & CONNECTED_BIT)
        jd_send(wifi_state->service_number, JD_WIFI_CMD_CONNECT, NULL, 0);
}

static void wifi_cmd_disconnect(void *arg) {
    disconnect();
    jd_send(wifi_state->service_number, JD_WIFI_CMD_DISCONNECT, NULL, 0);
}

static int wifi_cmd_sta_join(jd_packet_t *pkt) {
    if (pkt->service_size < 2 || pkt->data[0] == 0 || pkt->data[pkt->service_size - 1] != 0)
        return -1;

    const char *ssid = (char *)pkt->data;
    const char *pass = NULL;

    for (int i = 0; i < pkt->service_size; ++i) {
        if (!pkt->data[i] && i + 1 < pkt->service_size) {
            if (!pass)
                pass = (char *)&pkt->data[i + 1];
            else
                break;
        }
    }

    wifi_config_t *cfg = calloc(sizeof(wifi_config_t), 1);

    strlcpy((char *)cfg->sta.ssid, ssid, sizeof(cfg->sta.ssid));
    if (pass)
        strlcpy((char *)cfg->sta.password, pass, sizeof(cfg->sta.password));

    worker_run(worker, do_connect, cfg);

    return true;
}

static int wifi_cmd_query(int argc, char **argv) {
    wifi_config_t cfg;
    wifi_mode_t mode;

    esp_wifi_get_mode(&mode);
    if (WIFI_MODE_STA == mode) {
        int bits = xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, 0, 1, 0);
        if (bits & CONNECTED_BIT) {
            esp_wifi_get_config(WIFI_IF_STA, &cfg);
            LOG("sta mode, connected %s", cfg.ap.ssid);
        } else {
            LOG("sta mode, disconnected");
        }
    } else {
        LOG("NULL mode");
        return 0;
    }

    return 0;
}

static uint32_t wifi_get_local_ip(void) {
    int bits = xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, 0, 1, 0);
    tcpip_adapter_if_t ifx = TCPIP_ADAPTER_IF_AP;
    tcpip_adapter_ip_info_t ip_info;
    wifi_mode_t mode;

    esp_wifi_get_mode(&mode);
    if (WIFI_MODE_STA == mode) {
        bits = xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, 0, 1, 0);
        if (bits & CONNECTED_BIT) {
            ifx = TCPIP_ADAPTER_IF_STA;
        } else {
            ESP_LOGE(TAG, "sta has no IP");
            return 0;
        }
    }

    tcpip_adapter_get_ip_info(ifx, &ip_info);
    return ip_info.ip.addr;
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

static bool scan_done, reconnect;

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
    if (reconnect) {
        LOG("sta disconnect, reconnect...");
        reconnect = false;
        esp_wifi_connect();
    } else {
        LOG("sta disconnect");
    }
    raiseWifiEvent(WifiEvent::Disconnected);
}

static void got_ip_handler(void *arg, esp_event_base_t event_base, int32_t event_id,
                           void *event_data) {
    raiseWifiEvent(WifiEvent::GotIP);
}

static void init() {
    static bool initialized = false;

    if (initialized)
        return;

    esp_log_level_set(TAG, ESP_LOG_INFO);

    settings_init();

    esp_netif_init();
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
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

} // namespace _wifi
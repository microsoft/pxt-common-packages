#include "wifi.h"
#include "freertos/event_groups.h"
#include "esp_wifi.h"
#include "esp_netif.h"

#define TAG "wifi"
#define LOG(...) ESP_LOGI(TAG, __VA_ARGS__)
#define WIFI_ID 1234

void settings_init(void);

namespace _wifi {

/** Get ID used in events. */
//%
int eventID() {
    return WIFI_ID;
}

static bool scan_done, is_connected,  login_server;
static esp_netif_ip_info_t ip_info;

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
    LOG("sta disconnect");
    raiseWifiEvent(WifiEvent::Disconnected);
}

static void got_ip_handler(void *arg, esp_event_base_t event_base, int32_t event_id,
                           void *event_data) {
    is_connected = true;
    auto ev = (ip_event_got_ip_t *)event_data;
    ip_info = ev->ip_info;
    raiseWifiEvent(WifiEvent::GotIP);
}

static void init() {
    static bool initialized = false;

    if (initialized)
        return;

    esp_log_level_set(TAG, ESP_LOG_INFO);

    settings_init();

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_netif_config_t netif_config = ESP_NETIF_DEFAULT_WIFI_STA();
    esp_netif_t *netif = esp_netif_new(&netif_config);
    assert(netif);
    ESP_ERROR_CHECK(esp_netif_attach_wifi_station(netif));
    ESP_ERROR_CHECK(esp_wifi_set_default_wifi_sta_handlers());

    ESP_ERROR_CHECK(
        esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_SCAN_DONE, &scan_done_handler, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_DISCONNECTED,
                                               &disconnect_handler, NULL));
    ESP_ERROR_CHECK(
        esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &got_ip_handler, NULL));
    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
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
    // scan_config.scan_time.active.max = 600;
    esp_err_t err = esp_wifi_scan_start(&scan_config, false);
    LOG("scan start: %d", err);
}

/** Starts an HTTP server with a login dialog route */
//%
void startLoginServer(String hostName) {
    if (!login_server) {
        login_server = true;
        init();
        _wifi::startHttpServer(hostName->getUTF8Data());
    }
    raiseWifiEvent(WifiEvent::LoginServerStarted);
}

#define JD_WIFI_APFLAGS_HAS_PASSWORD 0x1
#define JD_WIFI_APFLAGS_WPS 0x2
#define JD_WIFI_APFLAGS_HAS_SECONDARY_CHANNEL_ABOVE 0x4
#define JD_WIFI_APFLAGS_HAS_SECONDARY_CHANNEL_BELOW 0x8
#define JD_WIFI_APFLAGS_IEEE_802_11B 0x100
#define JD_WIFI_APFLAGS_IEEE_802_11A 0x200
#define JD_WIFI_APFLAGS_IEEE_802_11G 0x400
#define JD_WIFI_APFLAGS_IEEE_802_11N 0x800
#define JD_WIFI_APFLAGS_IEEE_802_11AC 0x1000
#define JD_WIFI_APFLAGS_IEEE_802_11AX 0x2000
#define JD_WIFI_APFLAGS_IEEE_802_LONG_RANGE 0x8000

typedef struct jd_wifi_results {
    uint32_t flags; // APFlags
    uint32_t reserved;
    int8_t rssi;
    uint8_t channel;
    uint8_t bssid[6]; // u8[6]
    char ssid[32];    // string
} jd_wifi_results_t;

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

    if (err == ESP_OK || sta_number == 0) {

        int buffer_size = sizeof(jd_wifi_results_t) * sta_number;
        res = mkBuffer(NULL, buffer_size);
        auto dst = res->data;

        for (i = 0; i < sta_number; i++) {
            jd_wifi_results_t ent;
            wifi_ap_record_t *src = &ap_list_buffer[i];

            ent.reserved = 0;
            ent.flags = 0;

            if (src->phy_11b)
                ent.flags |= JD_WIFI_APFLAGS_IEEE_802_11B;
            if (src->phy_11g)
                ent.flags |= JD_WIFI_APFLAGS_IEEE_802_11G;
            if (src->phy_11n)
                ent.flags |= JD_WIFI_APFLAGS_IEEE_802_11N;
            if (src->phy_lr)
                ent.flags |= JD_WIFI_APFLAGS_IEEE_802_LONG_RANGE;
            if (src->wps)
                ent.flags |= JD_WIFI_APFLAGS_WPS;
            if (src->second == WIFI_SECOND_CHAN_ABOVE)
                ent.flags |= JD_WIFI_APFLAGS_HAS_SECONDARY_CHANNEL_ABOVE;
            if (src->second == WIFI_SECOND_CHAN_BELOW)
                ent.flags |= JD_WIFI_APFLAGS_HAS_SECONDARY_CHANNEL_BELOW;
            if (src->authmode != WIFI_AUTH_OPEN && src->authmode != WIFI_AUTH_WPA2_ENTERPRISE)
                ent.flags |= JD_WIFI_APFLAGS_HAS_PASSWORD;
            ent.channel = src->primary;
            ent.rssi = src->rssi;
            memcpy(ent.bssid, src->bssid, 6);
            memset(ent.ssid, 0, sizeof(ent.ssid));
            int len = strlen((char *)src->ssid);
            if (len > 32)
                len = 32;
            memcpy(ent.ssid, src->ssid, len);

            memcpy(dst, &ent, sizeof(ent));
            dst += sizeof(ent);
        }
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
    memset(&cfg, 0, sizeof(cfg));
    strlcpy((char *)cfg.sta.ssid, ssid->getUTF8Data(), sizeof(cfg.sta.ssid));
    strlcpy((char *)cfg.sta.password, pass->getUTF8Data(), sizeof(cfg.sta.password));

    if (is_connected)
        return -1;

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &cfg));
    ESP_ERROR_CHECK(esp_wifi_connect());

    return 0;
}

/** Initiate disconnection. */
//%
int disconnect() {
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

/** Check if login server is running */
//%
bool isLoginServerEnabled() {
    return login_server;
}

/** Return ipv4 address, netmask, and gateway. */
//%
Buffer ipInfo() {
    return mkBuffer(&ip_info, sizeof(ip_info));
}

/** Get RSSI of current connection or -128 when not connected. */
//%
int rssi() {
    wifi_ap_record_t info;
    if (esp_wifi_sta_get_ap_info(&info) == 0)
        return info.rssi;
    return -128;
}

} // namespace _wifi
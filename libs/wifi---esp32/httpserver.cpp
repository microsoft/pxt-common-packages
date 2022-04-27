#include "wifi.h"
#include "esp_netif.h"
#include "esp_wifi.h"
#include <esp_http_server.h>
#include <mdns.h>

#define TAG "http"
#define LOG(...) ESP_LOGI(TAG, __VA_ARGS__)

namespace _wifi {

static httpd_handle_t _server = NULL;
static const char* _lastApBuffer = NULL;
static wifi_config_t wifi_config;

esp_err_t login_handler(httpd_req_t *req)
{
    LOG("login");
    const char resp[] = "<style>html{background:#aaa}*{font-size:xx-large;font-family:monospace}form{min-height:100vh;display:flex;justify-content:center;align-items:center;flex-direction:column;gap:.5rem}</style><meta name='viewport'content='width=device-width,initial-scale=1'><form action='/add-ap'><label for='ssid'>WiFi:</label> <input name='name'id='ssid'placeholder='WiFi'required> <label for='password'>Password:</label> <input type='password'name='password'id='password'placeholder='Password'required> <input id='submit'type='submit'value='connect'></form>";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t add_ap_handler(httpd_req_t *req)
{
    LOG("add_ap");

    /* Read URL query string length and allocate memory for length + 1,
     * extra byte for null termination */
    size_t buf_len = httpd_req_get_url_query_len(req) + 1;
    if (buf_len > 1 && buf_len < 256) {
        char* buf = (char*)malloc(buf_len);
        if (httpd_req_get_url_query_str(req, buf, buf_len) == ESP_OK) {
            char name[64];
            char password[64];
            /* Get value of expected key from query string */
            if ((httpd_query_key_value(buf, "name", name, sizeof(name)) == ESP_OK) &&
                (httpd_query_key_value(buf, "password", password, sizeof(password)) == ESP_OK)) {
                // save ap info, let TS handle it
                if (NULL == _lastApBuffer) {
                    _lastApBuffer = buf;
                    pxt::raiseEvent(_wifi::eventID(), (int)_wifi::WifiEvent::AccessPointCredentialsAvailable);
                    const char resp[] = "Restarting...";
                    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
                    return ESP_OK;
                }
            }
        }
        free(buf);
        return ESP_OK;
    }

    httpd_resp_send_500(req);
    return ESP_OK;
}

//%
RefCollection *_readLastAccessPointCredentials() {
    auto res = Array_::mk();
    registerGCObj(res);

    char name[64];
    char password[64];
    /* Get value of expected key from query string */
    if (NULL != _lastApBuffer &&
        (httpd_query_key_value(_lastApBuffer, "name", name, sizeof(name)) == ESP_OK) &&
        (httpd_query_key_value(_lastApBuffer, "password", password, sizeof(password)) == ESP_OK)) {

        {
            auto str = mkString(name, -1);
            registerGCObj(str);
            res->head.push((TValue)str);
            unregisterGCObj(str);
        }   
        {
            auto str = mkString(password, -1);
            registerGCObj(str);
            res->head.push((TValue)str);
            unregisterGCObj(str);
        }
    }

    unregisterGCObj(res);
    return res;
}

// HTTP Error (404) Handler - Redirects all requests to the root page
esp_err_t http_404_error_handler(httpd_req_t *req, httpd_err_code_t err)
{
    // Set status
    httpd_resp_set_status(req, "302 Temporary Redirect");
    // Redirect to the "/" root directory
    httpd_resp_set_hdr(req, "Location", "/");
    // iOS requires content in the response to detect a captive portal, simply redirecting is not sufficient.
    httpd_resp_send(req, "Redirect to the captive portal", HTTPD_RESP_USE_STRLEN);

    ESP_LOGI(TAG, "Redirecting to root");
    return ESP_OK;
}

/* URI handler structure for GET / */
httpd_uri_t login_get = {
    .uri      = "/",
    .method   = HTTP_GET,
    .handler  = login_handler,
    .user_ctx = NULL
};

/* URI handler structure for POST /uri */
httpd_uri_t add_ap_get = {
    .uri      = "/add-ap",
    .method   = HTTP_GET,
    .handler  = add_ap_handler,
    .user_ctx = NULL
};

/* Function for starting the webserver */
static void init(const char* hostName)
{
    LOG("starting login server %s", hostName);
    const char* ssid = hostName;

    esp_netif_create_default_wifi_ap();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    memcpy(wifi_config.ap.ssid, ssid, strlen(ssid));
    wifi_config.ap.ssid_len = static_cast<uint8_t>(strlen(ssid));
    wifi_config.ap.channel = 11;
    wifi_config.ap.max_connection = 1;
    wifi_config.ap.authmode = WIFI_AUTH_OPEN;

    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_config));    

    /* Generate default configuration */
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    /* Empty handle to esp_http_server */
    httpd_handle_t server = NULL;

    ESP_ERROR_CHECK(httpd_start(&server, &config));

    httpd_register_uri_handler(server, &login_get);
    httpd_register_uri_handler(server, &add_ap_get);
    httpd_register_err_handler(server, HTTPD_404_NOT_FOUND, http_404_error_handler);

    esp_netif_ip_info_t ip_info;
    esp_netif_get_ip_info(esp_netif_get_handle_from_ifkey("WIFI_AP_DEF"), &ip_info);
    LOG("SoftAP ip: " IPSTR, IP2STR(&ip_info.ip));

    LOG("start mDNS service %s", hostName);
    ESP_ERROR_CHECK(mdns_init());
    ESP_ERROR_CHECK(mdns_hostname_set(hostName));
    ESP_ERROR_CHECK(mdns_service_add(NULL, "_http", "_tcp", 80, NULL, 0));

    _server = server;
}

void startHttpServer(const char* hostName) {
    if (NULL == _server) {
        init(hostName);
    }
}

}
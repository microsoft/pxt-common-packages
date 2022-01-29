#include "wifi.h"
#include "esp_netif.h"
#include "esp_wifi.h"
#include <esp_http_server.h>
#include <mdns.h>

#define TAG "http"
#define LOG(...) ESP_LOGI(TAG, __VA_ARGS__)

namespace http {

esp_err_t login_handler(httpd_req_t *req)
{
    LOG("login");
    const char resp[] = "<meta name='viewport'content='width=device-width,initial-scale=1'><h1>Join WiFi</h1><form action='/add-ap'><input name='name'id='ssid'placeholder='WiFi'required> <input name='password'id='password'placeholder='Password'required> <input type='submit'value='Connect'></form>";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t add_ap_handler(httpd_req_t *req)
{
    LOG("add_ap");

    /* Read URL query string length and allocate memory for length + 1,
     * extra byte for null termination */
    size_t buf_len = httpd_req_get_url_query_len(req) + 1;
    if (buf_len > 1) {
        char* buf = (char*)malloc(buf_len);
        if (httpd_req_get_url_query_str(req, buf, buf_len) == ESP_OK) {
            LOG("Found URL query => %s", buf);
            char name[64];
            char password[64];
            /* Get value of expected key from query string */
            if (httpd_query_key_value(buf, "name", name, sizeof(name)) == ESP_OK) {
                LOG("Found URL query parameter => name=%s", name);
                if (httpd_query_key_value(buf, "password", password, sizeof(password)) == ESP_OK) {
                    LOG("Found URL query parameter => password=%s", password);
                    // save ap info, restart


                    const char resp[] = "Restarting device...";
                    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

                    //systemReset();
                    return ESP_OK;
                }
            }
        }
        free(buf);
    }

    httpd_resp_send_500(req);
    return ESP_OK;
}

/* URI handler structure for GET / */
httpd_uri_t login_get = {
    .uri      = "/login",
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
httpd_handle_t start_webserver(void)
{
    LOG("starting server");
    ESP_ERROR_CHECK(esp_wifi_set_default_wifi_ap_handlers());
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));

    /* Generate default configuration */
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    /* Empty handle to esp_http_server */
    httpd_handle_t server = NULL;

    /* Start the httpd server */
    if (httpd_start(&server, &config) == ESP_OK) {
        /* Register URI handlers */
        httpd_register_uri_handler(server, &login_get);
        httpd_register_uri_handler(server, &add_ap_get);

        esp_netif_ip_info_t ip_info;
        esp_netif_get_ip_info(esp_netif_get_handle_from_ifkey("WIFI_AP_DEF"), &ip_info);
        LOG("softap ip: " IPSTR "\n", IP2STR(&ip_info.ip));
    }
    else {
        LOG("error starting server");
    }
    return server;
}

void start_mdns_service()
{
    LOG("start mDNS service");
    ESP_ERROR_CHECK(mdns_init());
    ESP_ERROR_CHECK(mdns_hostname_set("jacdac"));
    ESP_ERROR_CHECK(mdns_service_add(NULL, "_http", "_tcp", 80, NULL, 0));
}

static httpd_handle_t _server = NULL;

/**
Starts a simple HTTP web server
**/
//%
void startHttpServer() {
    if (NULL == _server) {
        _server = start_webserver();
        start_mdns_service();
    }
}

}
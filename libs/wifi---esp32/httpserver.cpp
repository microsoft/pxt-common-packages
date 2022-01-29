#include "wifi.h"
#include <tcpip_adapter.h>
#include <esp_netif.h>
#include <esp_http_server.h>
#include <mdns.h>

#define TAG "http"
#define LOG(...) ESP_LOGI(TAG, __VA_ARGS__)

namespace http {

esp_err_t get_handler(httpd_req_t *req)
{
    LOG("GET");
    const char resp[] = "<meta name='viewport'content='width=device-width,initial-scale=1'><h1>Join WiFi</h1><form action='/add-ap'><input name='name'id='ssid'placeholder='WiFi'required> <input name='password'id='password'placeholder='Password'required> <input type='submit'value='Connect'></form>";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t add_ap_handler(httpd_req_t *req)
{
    LOG("post");

    /* Send a simple response */
    const char resp[] = "URI POST Response";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

/* URI handler structure for GET / */
httpd_uri_t uri_get = {
    .uri      = "/login",
    .method   = HTTP_GET,
    .handler  = get_handler,
    .user_ctx = NULL
};

/* URI handler structure for POST /uri */
httpd_uri_t uri_post = {
    .uri      = "/add-ap",
    .method   = HTTP_GET,
    .handler  = add_ap_handler,
    .user_ctx = NULL
};

/* Function for starting the webserver */
httpd_handle_t start_webserver(void)
{
    LOG("starting server");

    /* Generate default configuration */
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    /* Empty handle to esp_http_server */
    httpd_handle_t server = NULL;

    /* Start the httpd server */
    if (httpd_start(&server, &config) == ESP_OK) {
        /* Register URI handlers */
        httpd_register_uri_handler(server, &uri_get);
        httpd_register_uri_handler(server, &uri_post);

        esp_netif_ip_info_t ip_info;
        esp_netif_get_ip_info(esp_netif_get_handle_from_ifkey("WIFI_AP_DEF"), &ip_info);
        LOG("ip: " IPSTR "\n", IP2STR(&ip_info.ip));
    }
    else {
        LOG("error starting server");
    }
    return server;
}

/* Function for stopping the webserver */
void stop_webserver(httpd_handle_t server)
{
    if (server) {
        LOG("stop server");
        /* Stop the httpd server */
        httpd_stop(server);
    }
}

void start_mdns_service()
{
    LOG("start mDNS service");
    //initialize mDNS service
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
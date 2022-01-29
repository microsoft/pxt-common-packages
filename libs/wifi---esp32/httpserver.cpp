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
    const char resp[] = "<h1>Join WiFi</h1><form action='/login'><input name='name'id='ssid'placeholder='WiFi'required> <input name='password'id='password'placeholder='Password'required> <input type='submit'value='Connect'></form>";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_handler(httpd_req_t *req)
{
    LOG("post");

    /* Destination buffer for content of HTTP POST request.
     * httpd_req_recv() accepts char* only, but content could
     * as well be any binary data (needs type casting).
     * In case of string data, null termination will be absent, and
     * content length would give length of string */
    char content[100];

    /* Truncate if content length larger than the buffer */
    size_t recv_size = pxt::min(req->content_len, sizeof(content));

    int ret = httpd_req_recv(req, content, recv_size);
    if (ret <= 0) {  /* 0 return value indicates connection closed */
        /* Check if timeout occurred */
        if (ret == HTTPD_SOCK_ERR_TIMEOUT) {
            /* In case of timeout one can choose to retry calling
             * httpd_req_recv(), but to keep it simple, here we
             * respond with an HTTP 408 (Request Timeout) error */
            httpd_resp_send_408(req);
        }
        /* In case of error, returning ESP_FAIL will
         * ensure that the underlying socket is closed */
        return ESP_FAIL;
    }

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
    .uri      = "/login",
    .method   = HTTP_POST,
    .handler  = post_handler,
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

        tcpip_adapter_ip_info_t ipInfo;                 
        tcpip_adapter_get_ip_info(TCPIP_ADAPTER_IF_AP, &ipInfo);
        LOG("tcp ip: " IPSTR "\n", IP2STR(&ipInfo.ip));  
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
    ESP_ERROR_CHECK(mdns_hostname_set("jacdac-iot"));
    ESP_ERROR_CHECK(mdns_instance_name_set("Jacdac ESP32-S2 IoT"));
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
      //  start_mdns_service();
    }
}

}
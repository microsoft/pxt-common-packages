#include "wifi.h"

#include "lwip/err.h"
#include "lwip/sockets.h"
#include "lwip/sys.h"
#include "lwip/netdb.h"
#include "lwip/dns.h"

#include "mbedtls/platform.h"
#include "mbedtls/net_sockets.h"
#include "mbedtls/esp_debug.h"
#include "mbedtls/ssl.h"
#include "mbedtls/entropy.h"
#include "mbedtls/ctr_drbg.h"
#include "mbedtls/error.h"
#include "mbedtls/certs.h"

#define TAG "SSL"

extern const char root_certs[];

namespace pxt {

struct _ssl_conn_t {
    uint32_t flags;
    mbedtls_ssl_context ssl;
    mbedtls_net_context netctx;
};

static mbedtls_x509_crt cacert;
static mbedtls_ssl_config conf;
static mbedtls_entropy_context entropy;
static mbedtls_ctr_drbg_context ctr_drbg;

static void init_ca(void) {
    if (cacert.version)
        return;

    esp_log_level_set(TAG, ESP_LOG_INFO);

    mbedtls_x509_crt_init(&cacert);
    mbedtls_ssl_config_init(&conf);

    // it seems, to get lazy loading of certs one would have to modify x509_crt_check_parent()
    // to lazily load the cert when the name matches
    ESP_LOGI(TAG, "Loading the CA root certificates...");
    int ret = mbedtls_x509_crt_parse(&cacert, (const uint8_t *)root_certs, strlen(root_certs) + 1);
    if (ret < 0) {
        ESP_LOGE(TAG, "mbedtls_x509_crt_parse returned -0x%x\n\n", -ret);
        abort();
    }

    ESP_LOGI(TAG, "Setting up the SSL/TLS structure...");
    if ((ret =
             mbedtls_ssl_config_defaults(&conf, MBEDTLS_SSL_IS_CLIENT, MBEDTLS_SSL_TRANSPORT_STREAM,
                                         MBEDTLS_SSL_PRESET_DEFAULT)) != 0) {
        ESP_LOGE(TAG, "mbedtls_ssl_config_defaults returned %d", ret);
        abort();
    }

    mbedtls_ssl_conf_authmode(&conf, MBEDTLS_SSL_VERIFY_REQUIRED);
    mbedtls_ssl_conf_ca_chain(&conf, &cacert, NULL);

    mbedtls_ctr_drbg_init(&ctr_drbg);
    mbedtls_entropy_init(&entropy);
    ESP_LOGI(TAG, "Seeding the random number generator");
    if ((ret = mbedtls_ctr_drbg_seed(&ctr_drbg, mbedtls_entropy_func, &entropy, NULL, 0)) != 0) {
        ESP_LOGE(TAG, "mbedtls_ctr_drbg_seed returned %d", ret);
        abort();
    }

    mbedtls_ssl_conf_rng(&conf, mbedtls_ctr_drbg_random, &ctr_drbg);
#ifdef CONFIG_MBEDTLS_DEBUG
    mbedtls_esp_enable_debug_log(&conf, CONFIG_MBEDTLS_DEBUG_LEVEL);
#endif
}

ssl_conn_t *ssl_alloc(void) {
    ssl_conn_t *conn = (ssl_conn_t *)calloc(1, sizeof(ssl_conn_t));
    conn->flags = 1;
    mbedtls_ssl_init(&conn->ssl);
    mbedtls_net_init(&conn->netctx);
    return conn;
}

bool ssl_is_connected(ssl_conn_t *conn) {
    return conn->netctx.fd != -1;
}

static void ssl_clear(ssl_conn_t *conn) {
    if (conn->flags) {
        conn->flags = 0;
        mbedtls_ssl_session_reset(&conn->ssl);
        mbedtls_net_free(&conn->netctx);
        mbedtls_ssl_free(&conn->ssl);
    }
}

int ssl_connect(ssl_conn_t *conn, const char *hostname, int port) {
    int ret;
    char port_string[6]; // mbedtls_net_connect() wants port as string

    init_ca();

    // just in case
    mbedtls_ssl_init(&conn->ssl);
    mbedtls_net_init(&conn->netctx);

    ESP_LOGI(TAG, "Setting hostname for TLS session...");

    /* Hostname set here should match CN in server certificate */
    if ((ret = mbedtls_ssl_set_hostname(&conn->ssl, hostname)) != 0) {
        ESP_LOGE(TAG, "mbedtls_ssl_set_hostname returned -0x%x", -ret);
        goto exit;
    }

    if ((ret = mbedtls_ssl_setup(&conn->ssl, &conf)) != 0) {
        ESP_LOGE(TAG, "mbedtls_ssl_setup returned -0x%x\n\n", -ret);
        goto exit;
    }

    itoa(port, port_string, 10);

    ESP_LOGI(TAG, "Connecting to %s:%s...", hostname, port_string);

    if ((ret = mbedtls_net_connect(&conn->netctx, hostname, port_string, MBEDTLS_NET_PROTO_TCP)) !=
        0) {
        ESP_LOGE(TAG, "mbedtls_net_connect returned -%x", -ret);
        goto exit;
    }

    ESP_LOGI(TAG, "Connected.");

    mbedtls_ssl_set_bio(&conn->ssl, &conn->netctx, mbedtls_net_send, mbedtls_net_recv, NULL);

    ESP_LOGI(TAG, "Performing the SSL/TLS handshake...");

    while ((ret = mbedtls_ssl_handshake(&conn->ssl)) != 0) {
        if (ret != MBEDTLS_ERR_SSL_WANT_READ && ret != MBEDTLS_ERR_SSL_WANT_WRITE) {
            char strerr[128];

            ESP_LOGE(TAG, "mbedtls_ssl_handshake returned -0x%x", -ret);

            mbedtls_strerror(ret, strerr, 128);
            ESP_LOGE(TAG, "info: %s", strerr);

            goto exit;
        }
    }

    ESP_LOGI(TAG, "Hand-shaken.");

    mbedtls_net_set_nonblock(&conn->netctx);
    return 0;

exit:
    ssl_clear(conn);
    return -1;
}

int ssl_write(ssl_conn_t *conn, const void *data, uint32_t len) {
    int ret;
    int written_bytes = 0;

    do {
        ret = mbedtls_ssl_write(&conn->ssl, (const uint8_t *)data + written_bytes,
                                len - written_bytes);
        if (ret >= 0) {
            written_bytes += ret;
        } else if (ret != MBEDTLS_ERR_SSL_WANT_WRITE && ret != MBEDTLS_ERR_SSL_WANT_READ) {
            ESP_LOGE(TAG, "mbedtls_ssl_write returned -0x%x", -ret);
            ssl_clear(conn);
            return ret;
        }
    } while (written_bytes < len);

    return written_bytes;
}

int ssl_read(ssl_conn_t *conn, void *data, uint32_t len) {
    int ret = mbedtls_ssl_read(&conn->ssl, (uint8_t *)data, len);

    if (ret == MBEDTLS_ERR_SSL_WANT_READ || ret == MBEDTLS_ERR_SSL_WANT_WRITE)
        return 0;

    if (ret == MBEDTLS_ERR_SSL_PEER_CLOSE_NOTIFY || ret == 0) {
        ssl_clear(conn);
        return MBEDTLS_ERR_SSL_PEER_CLOSE_NOTIFY;
    }

    if (ret < 0) {
        ESP_LOGE(TAG, "mbedtls_ssl_read returned -0x%x", -ret);
        ssl_clear(conn);
        return ret;
    }

    return ret;
}

void ssl_close(ssl_conn_t *conn) {
    mbedtls_ssl_close_notify(&conn->ssl);
    ssl_clear(conn);
    free(conn);
}

int ssl_get_bytes_avail(ssl_conn_t *conn) {
    int ret = mbedtls_ssl_read(&conn->ssl, NULL, 0);
    int bytes = mbedtls_ssl_get_bytes_avail(&conn->ssl);

    if (bytes == 0 && ret != 0 && ret != MBEDTLS_ERR_SSL_WANT_READ)
        ssl_clear(conn);

    return bytes;
}

} // namespace pxt
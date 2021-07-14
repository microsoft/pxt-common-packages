#pragma once

#include "pxt.h"
#include "esp_log.h"

namespace pxt {
typedef struct _ssl_conn_t ssl_conn_t;

ssl_conn_t *ssl_alloc(void);
int ssl_connect(ssl_conn_t *conn, const char *hostname, int port);
bool ssl_is_connected(ssl_conn_t *conn);
int ssl_write(ssl_conn_t *conn, const void *data, uint32_t len);
int ssl_get_bytes_avail(ssl_conn_t *conn);
int ssl_read(ssl_conn_t *conn, void *data, uint32_t len);
void ssl_close(ssl_conn_t *conn);
} // namespace pxt

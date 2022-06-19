#include "wifi.h"

#include "esp_tls.h"
#include "esp_crt_bundle.h"

#define TAG "ssl"
#define LOG(...) ESP_LOGI(TAG, __VA_ARGS__)

#define MAX_SOCKET 16

namespace _wifi {

static esp_tls_cfg_t tls_cfg;

struct socket_t {
    esp_tls_t *ssl;
    int bytesAvailable;
    struct read_args *readers;
};

static worker_t worker;
static socket_t *sockets[MAX_SOCKET];

static void process_reader(struct read_args *args);

static void update_bytes_avail(socket_t *sock) {
    if (!sock->ssl)
        return;

    int ret = esp_tls_conn_read(sock->ssl, NULL, 0);
    int bytes = esp_tls_get_bytes_avail(sock->ssl);
    int emitEvent = 0;

    if (bytes == 0 && ret != 0 && ret != ESP_TLS_ERR_SSL_WANT_READ) {
        esp_tls_conn_destroy(sock->ssl);
        sock->ssl = NULL;
        emitEvent = 1;
    }

    // DMESG("updbyt: %d r=%d", bytes, ret);

    if (bytes > 0) {
        // if we went from 0 to more, raise event
        if (sock->bytesAvailable == 0)
            emitEvent = 1;
        sock->bytesAvailable = bytes;
    } else
        sock->bytesAvailable = 0;

    if (emitEvent)
        for (int i = 0; i < MAX_SOCKET; ++i) {
            if (sockets[i] == sock) {
                raiseEvent(eventID(), 1000 + i);
                break;
            }
        }
}

static void flush_ssl(void *) {
    for (int i = 0; i < MAX_SOCKET; ++i) {
        auto s = sockets[i];
        if (!s || !s->ssl)
            continue;
        update_bytes_avail(s);
        while (s->bytesAvailable && s->readers) {
            process_reader(s->readers);
        }
    }
}

static void socket_init() {
    if (worker)
        return;
    worker = worker_alloc("ssl", 10 * 1024);
    worker_set_idle(worker, flush_ssl, NULL);
    tls_cfg.crt_bundle_attach = esp_crt_bundle_attach;
    tls_cfg.non_block = true;
    tls_cfg.timeout_ms = 30000;
}

/** Allocate new socket. */
//%
int socketAlloc() {
    socket_init();
    for (int i = 1; i < MAX_SOCKET; ++i) {
        if (!sockets[i]) {
            sockets[i] = new socket_t;
            memset(sockets[i], 0, sizeof(*sockets[i]));
            return i;
        }
    }
    return -1;
}

#define GET_SOCK()                                                                                 \
    if (fd <= 0 || fd >= MAX_SOCKET)                                                               \
        return -10;                                                                                \
    auto sock = sockets[fd];                                                                       \
    if (!sock)                                                                                     \
        return -11;

#define GET_SOCK_SSL()                                                                             \
    GET_SOCK();                                                                                    \
    if (!sock->ssl)                                                                                \
        return -12;

struct conn_args {
    socket_t *sock;
    FiberContext *ctx;
    const char *host;
    int port;
};

PXT_DEF_STRING(sOOM, "ssl: Out of memory")
PXT_DEF_STRING(sHandshake, "ssl: Handshake failed")
PXT_DEF_STRING(sError, "ssl: error")

static void check_error(socket_t *sock, int r) {
    if (r < 0) {
        int err_code, flags;
        esp_err_t err =
            esp_tls_get_and_clear_last_error(sock->ssl->error_handle, &err_code, &flags);

        DMESG("ESP TLS error: err=%x (%d/%d) res=%d", err, err_code, flags, r);
        vm_stack_trace();

#if 0
        // can't really throw from here
        if (err == ESP_ERR_MBEDTLS_SSL_SETUP_FAILED) {
            pxt::throwValue((TValue)sOOM);
        } else if (err == ESP_ERR_MBEDTLS_SSL_HANDSHAKE_FAILED) {
            pxt::throwValue((TValue)sHandshake);
        } else {
            pxt::throwValue((TValue)sError);
        }
#endif
    }
}

static void worker_conn(conn_args *args) {
    int r = esp_tls_conn_new_sync(args->host, strlen(args->host), args->port, &tls_cfg,
                                  args->sock->ssl);
    check_error(args->sock, r);
    resumeFiber(args->ctx, fromInt(r));
    delete args;
}

/** Connect with TLS */
//% promise
int socketConnectTLS(int fd, String host, int port) {
    memInfo();
    GET_SOCK();
    if (sock->ssl)
        return -2;
    if (port <= 0 || port > 0xffff)
        return -3;
    sock->ssl = esp_tls_init();
    auto args = new conn_args;
    args->host = host->getUTF8Data();
    args->port = port;
    args->sock = sock;
    args->ctx = suspendFiber();
    worker_run(worker, (TaskFunction_t)worker_conn, args);
    return 0; // ignored
}

struct write_args {
    socket_t *sock;
    FiberContext *ctx;
    Buffer data;
};

static void worker_write(write_args *args) {
    int r = esp_tls_conn_write(args->sock->ssl, args->data->data, args->data->length);
    check_error(args->sock, r);
    resumeFiber(args->ctx, fromInt(r));
    delete args;
}

/** Write to socket */
//% promise
int socketWrite(int fd, Buffer data) {
    GET_SOCK_SSL();

    auto args = new write_args;
    args->data = data;
    args->sock = sock;
    args->ctx = suspendFiber();
    worker_run(worker, (TaskFunction_t)worker_write, args);
    return 0; // ignored
}

struct read_args {
    socket_t *sock;
    FiberContext *ctx;
    int size;
    void *buf;
    struct read_args *next;
};

static Buffer mk_read_buffer(read_args *args) {
    auto res = mkBuffer(args->buf, args->size);
    free(args->buf);
    delete args;
    return res;
}

static void process_reader(read_args *args) {
    auto sock = args->sock;
    sock->readers = args->next;
    int num = args->size;
    if (num > sock->bytesAvailable)
        num = sock->bytesAvailable;
    args->buf = malloc(num);
    int r = esp_tls_conn_read(sock->ssl, args->buf, num);
    if (r < 0) {
        free(args->buf);
        resumeFiber(args->ctx, fromInt(r));
        delete args;
    } else {
        args->size = r;
        resumeFiberWithFn(args->ctx, (fiber_resume_t)mk_read_buffer, args);
    }

    update_bytes_avail(sock);
}

static void worker_read(read_args *args) {
    auto sock = args->sock;
    auto rd = sock->readers;
    while (rd && rd->next)
        rd = rd->next;
    if (rd) {
        rd->next = args;
        return; // there are other readers in front of us; don't do anything yet
    }

    sock->readers = args;
    update_bytes_avail(sock);
    if (sock->bytesAvailable)
        process_reader(args);
}

/** Read from a socket; the return type is really number|Buffer */
//% promise
int socketRead(int fd, int size) {
    GET_SOCK_SSL();

    if (size < 0)
        return -20;

    if (size == 0)
        return 0;

    auto args = new read_args;
    args->size = size;
    args->sock = sock;
    args->ctx = suspendFiber();
    args->next = NULL;
    worker_run(worker, (TaskFunction_t)worker_read, args);
    return 0; // ignored
}

/** See how many bytes are available for reading */
//%
int socketBytesAvailable(int fd) {
    GET_SOCK_SSL();
    return sock->bytesAvailable;
}

static void worker_close(socket_t *sock) {
    if (sock->ssl) {
        esp_tls_conn_destroy(sock->ssl);
        sock->ssl = NULL;
    }
}

/** Close the socket if open */
//%
int socketClose(int fd) {
    GET_SOCK();
    sockets[fd] = NULL;
    worker_run(worker, (TaskFunction_t)worker_close, sock);
    // wait for the actual close - we only really have memory for one open SSL socket...
    while (sock->ssl)
        vTaskDelay(5);
    free(sock);
    return 0;
}

} // namespace _wifi
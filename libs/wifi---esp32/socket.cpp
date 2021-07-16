#include "wifi.h"

#include "freertos/event_groups.h"
#include "esp_wifi.h"
#include "esp_netif.h"

#define TAG "tcp"
#define LOG(...) ESP_LOGI(TAG, __VA_ARGS__)

#define MAX_SOCKET 16

namespace _wifi {

struct socket_t {
    ssl_conn_t *ssl;
    int bytesAvailable;
    struct read_args *readers;
};

static worker_t worker;
static socket_t *sockets[MAX_SOCKET];

static void process_reader(struct read_args *args);

static void flush_ssl(void *) {
    for (int i = 0; i < MAX_SOCKET; ++i) {
        auto s = sockets[i];
        if (!s || !s->ssl)
            continue;
        s->bytesAvailable = ssl_get_bytes_avail(s->ssl);
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

/*
        public socketClose(socket_num: number): void {
        }
*/

#define GET_SOCK()                                                                                 \
    if (fd <= 0 || fd >= MAX_SOCKET)                                                               \
        return -10;                                                                                \
    auto sock = sockets[fd];                                                                       \
    if (!sock)                                                                                     \
        return -11;

#define GET_SOCK_SSL()                                                                             \
    GET_SOCK();                                                                                    \
    if (!sock->ssl)                                                                                \
        return -12;                                                                                \
    if (!ssl_is_connected(sock->ssl))                                                              \
        return -13;

struct conn_args {
    socket_t *sock;
    FiberContext *ctx;
    const char *host;
    int port;
};

static void worker_conn(conn_args *args) {
    int r = ssl_connect(args->sock->ssl, args->host, args->port);
    resumeFiber(args->ctx, fromInt(r));
    delete args;
}

/** Connect with TLS */
//%
int socketConnectTLS(int fd, String host, int port) {
    memInfo();
    GET_SOCK();
    if (sock->ssl)
        return -2;
    if (port <= 0 || port > 0xffff)
        return -3;
    sock->ssl = ssl_alloc();
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
    int r = ssl_write(args->sock->ssl, args->data->data, args->data->length);
    resumeFiber(args->ctx, fromInt(r));
    delete args;
}

/** Write to socket */
//%
int socketWrite(int fd, Buffer data) {
    GET_SOCK_SSL();

    memInfo();

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
    memInfo();
    return res;
}

static void process_reader(read_args *args) {
    auto sock = args->sock;
    sock->readers = args->next;
    int num = args->size;
    if (num > sock->bytesAvailable)
        num = sock->bytesAvailable;
    args->buf = malloc(num);
    int r = ssl_read(sock->ssl, args->buf, num);
    if (r < 0) {
        free(args->buf);
        resumeFiber(args->ctx, fromInt(r));
        delete args;
    } else {
        args->size = r;
        resumeFiberWithFn(args->ctx, (fiber_resume_t)mk_read_buffer, args);
    }

    sock->bytesAvailable = ssl_get_bytes_avail(sock->ssl);
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
    sock->bytesAvailable = ssl_get_bytes_avail(sock->ssl);
    if (sock->bytesAvailable)
        process_reader(args);
}

/** Read from a socket; the return type is really number|Buffer */
//%
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
    ssl_close(sock->ssl);
    sock->ssl = NULL;
    free(sock);
}

/** Close the socket if open */
//%
int socketClose(int fd) {
    GET_SOCK_SSL();
    sockets[fd] = NULL;
    worker_run(worker, (TaskFunction_t)worker_close, sock);
    // don't wait for the actual close
    return 0;
}

} // namespace _wifi
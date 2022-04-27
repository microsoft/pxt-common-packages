#include "pxt.h"
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <stdarg.h>
#include <fcntl.h>

#include "esp_log.h"

namespace pxt {

#define LOG_QUEUE_SIZE (2 * 1024)
class LogQueue {
    void writeCore(const char *buf, int len);

  public:
    int ptr;
    char buffer[LOG_QUEUE_SIZE];
    int rdPtr;
    int numWrap;
    LogQueue();
    int write(const char *buf, int len);
    int read(char *buf, int len);
};

} // namespace pxt

LogQueue codalLogStore;

namespace pxt {
LogQueue::LogQueue() {
    ptr = 0;
    rdPtr = 0;
    numWrap = 0;
    memset(buffer, 0, sizeof(buffer));
}

void LogQueue::writeCore(const char *buf, int len) {
    memcpy(buffer + ptr, buf, len);
    // did we pass it?
    if (ptr < rdPtr && rdPtr <= ptr + len)
        rdPtr = -1;
    ptr += len;
}

int LogQueue::read(char *buf, int len) {
    if (rdPtr < 0) {
        if (numWrap == 0) {
            rdPtr = 0;
        } else {
            rdPtr = ptr + 1;
        }
    }

    if (rdPtr <= ptr) {
        int av = ptr - rdPtr;
        if (len > av)
            len = av;
        memcpy(buf, buffer + rdPtr, len);
        rdPtr += len;
    } else {
        int latter = sizeof(buffer) - rdPtr;

        if (latter >= len) {
            memcpy(buf, buffer + rdPtr, len);
            rdPtr += len;
        } else {
            memcpy(buf, buffer + rdPtr, latter);
            buf += latter;
            int len2 = len - latter;
            if (len2 > ptr)
                len2 = ptr;
            memcpy(buf, buffer, len2);
            rdPtr = len2;
            len = latter + len2;
        }
    }

    if (rdPtr >= (int)sizeof(buffer))
        rdPtr = 0;

    return len;
}

int LogQueue::write(const char *buf, int len) {
    if (len > (int)sizeof(buffer) / 2)
        return -1;

    int left = sizeof(buffer) - ptr;

    if (left < len + 1) {
        writeCore(buf, left);
        buf += left;
        len -= left;
        ptr = 0;
        numWrap++;
        if (rdPtr == 0)
            rdPtr = -1;
    }

    writeCore(buf, len);
    buffer[ptr] = 0;

    return 0;
}

void dumpDmesg() {
    // not enabled
}

void ets_log_dmesg() {
    char buf[500];
    int prefix = 0;
    for (;;) {
        int len = codalLogStore.read(buf + prefix, sizeof(buf) - 1 - prefix);
        if (len == 0 && prefix != 0) {
            buf[prefix] = '\n'; // make sure we flush
            len = 1;
        }
        len += prefix;
        if (len == 0)
            return;
        int beg = 0;
        for (int i = 0; i < len; ++i) {
            if (buf[i] == '\n' || i - beg > 200) {
                buf[i] = 0;
                ets_printf(LOG_FORMAT(W, "%s"), esp_log_timestamp(), "DMESG", buf + beg);
                beg = i + 1;
            }
        }
        prefix = len - beg;
        if (prefix)
            memmove(buf, buf + beg, prefix);
    }
}

void dmesg_flush() {}

} // namespace pxt

static void writeNum(char *buf, uint32_t n, bool full) {
    int i = 0;
    int sh = 28;
    while (sh >= 0) {
        int d = (n >> sh) & 0xf;
        if (full || d || sh == 0 || i) {
            buf[i++] = d > 9 ? 'A' + d - 10 : '0' + d;
        }
        sh -= 4;
    }
    buf[i] = 0;
}

#define WRITEN(p, sz_)                                                                             \
    do {                                                                                           \
        sz = sz_;                                                                                  \
        ptr += sz;                                                                                 \
        if (ptr < dstsize) {                                                                       \
            memcpy(dst + ptr - sz, p, sz);                                                         \
            dst[ptr] = 0;                                                                          \
        }                                                                                          \
    } while (0)

int codal_vsprintf(char *dst, unsigned dstsize, const char *format, va_list ap) {
    const char *end = format;
    unsigned ptr = 0, sz;
    char buf[16];

    for (;;) {
        char c = *end++;
        if (c == 0 || c == '%') {
            if (format != end)
                WRITEN(format, end - format - 1);
            if (c == 0)
                break;

            uint32_t val = va_arg(ap, uint32_t);
            c = *end++;
            buf[1] = 0;
            switch (c) {
            case 'c':
                buf[0] = val;
                break;
            case 'd':
                itoa(val, buf);
                break;
            case 'x':
            case 'p':
            case 'X':
                buf[0] = '0';
                buf[1] = 'x';
                writeNum(buf + 2, val, c != 'x');
                break;
            case 's':
                WRITEN((char *)(void *)val, strlen((char *)(void *)val));
                buf[0] = 0;
                break;
            case '%':
                buf[0] = c;
                break;
            default:
                buf[0] = '?';
                break;
            }
            format = end;
            WRITEN(buf, strlen(buf));
        }
    }

    return ptr;
}

DLLEXPORT int pxt_get_logs(int logtype, char *dst, int maxSize) {
    if (logtype != 0)
        return 0;
    target_disable_irq();
    int r = codalLogStore.read(dst, maxSize);
    target_enable_irq();
    return r;
}

static void dmesgRaw(const char *buf, uint32_t len) {
    codalLogStore.write(buf, len);
}

void vdmesg(const char *format, va_list arg) {
    char buf[500];

    target_disable_irq();

    // snprintf(buf, sizeof(buf), "[%8d] ", current_time_ms());
    // dmesgRaw(buf, (uint32_t)strlen(buf));

    codal_vsprintf(buf, sizeof(buf) - 3, format, arg);
    // ets_printf(LOG_FORMAT(W, "%s"), esp_log_timestamp(), "DMESG", buf);
    int len = strlen(buf);
    buf[len++] = '\n';
    dmesgRaw(buf, len);

    target_enable_irq();
}

void dmesg(const char *format, ...) {
    va_list arg;
    va_start(arg, format);
    vdmesg(format, arg);
    va_end(arg);
}

extern int int_level;
extern "C" void panic_print_char(const char c);
extern "C" void panic_print_str(const char *str);
extern "C" void panic_print_dec(int d);

extern "C" void user_panic_handler() {
    panic_print_str("\r\nDMESG:\r\n");
    for (;;) {
        char c;
        int r = codalLogStore.read(&c, 1);
        if (r == 0)
            break;
        if (c == '\n')
            panic_print_char('\r');
        panic_print_char(c);
    }
    panic_print_str("END DMESG\r\nInt: ");
    panic_print_dec(int_level);
    panic_print_str("\r\n");
}

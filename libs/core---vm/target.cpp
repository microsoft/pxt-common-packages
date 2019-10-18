#include "pxt.h"
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <stdarg.h>
#include <fcntl.h>

//#define LOG_TO_STDERR 1
//#define LOG_TO_FILE 1

namespace pxt {

void target_exit() {
    systemReset();
}

extern "C" void target_reset() {
    vmStartFromUser(NULL);
}

void target_startup() {}

#ifdef LOG_TO_FILE
static FILE *dmesgFile;
#endif

#define LOG_QUEUE_SIZE (128 * 1024)
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
} // namespace pxt

LogQueue codalLogStore;

DLLEXPORT int pxt_get_logs(int logtype, char *dst, int maxSize) {
    if (logtype != 0)
        return 0;
    target_disable_irq();
    int r = codalLogStore.read(dst, maxSize);
    target_enable_irq();
    return r;
}

namespace pxt {
static void dmesgRaw(const char *buf, uint32_t len) {
#ifdef LOG_TO_FILE
    if (!dmesgFile) {
        dmesgFile = fopen("dmesg.txt", "w");
        if (!dmesgFile)
            dmesgFile = stderr;
    }
#endif

    if (codalLogStore.write(buf, len) != 0)
        return; // if message too long, skip

#ifdef LOG_TO_FILE
    fwrite(buf, 1, len, dmesgFile);
#endif
#ifdef LOG_TO_STDERR
    fwrite(buf, 1, len, stderr);
#endif
}

void deepSleep() {
    // nothing to do
}

void dmesg_flush() {
#ifdef LOG_TO_FILE
    fflush(dmesgFile);
#endif
}

static void dmesgFlushRaw() {
    dmesg_flush();
}

void vdmesg(const char *format, va_list arg) {
    char buf[500];

    target_disable_irq();

    snprintf(buf, sizeof(buf), "[%8d] ", current_time_ms());
    dmesgRaw(buf, (uint32_t)strlen(buf));
    vsnprintf(buf, sizeof(buf), format, arg);
    dmesgRaw(buf, (uint32_t)strlen(buf));
    dmesgRaw("\n", 1);

    target_enable_irq();

    dmesgFlushRaw();
}

void dmesg(const char *format, ...) {
    va_list arg;
    va_start(arg, format);
    vdmesg(format, arg);
    va_end(arg);
}

uint64_t getLongSerialNumber() {
    return 0;
}

} // namespace pxt

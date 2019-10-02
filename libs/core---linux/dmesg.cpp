#include "pxt.h"
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <stdarg.h>
#include <fcntl.h>

namespace pxt {

static FILE *dmesgFile;

static int dmesgPtr;
static int dmesgSerialPtr;
static char dmesgBuf[4096];

void dumpDmesg() {
    auto len = dmesgPtr - dmesgSerialPtr;
    if (len == 0)
        return;
    sendSerial(dmesgBuf + dmesgSerialPtr, len);
    dmesgSerialPtr = dmesgPtr;
}


static void dmesgRaw(const char *buf, uint32_t len) {
    if (!dmesgFile) {
        dmesgFile = fopen("/tmp/dmesg.txt", "w");
        if (!dmesgFile)
            dmesgFile = stderr;
    }

    if (len > sizeof(dmesgBuf) / 2)
        return;
    if (dmesgPtr + len > sizeof(dmesgBuf)) {
        dmesgPtr = 0;
        dmesgSerialPtr = 0;
    }
    memcpy(dmesgBuf + dmesgPtr, buf, len);
    dmesgPtr += len;
    fwrite(buf, 1, len, dmesgFile);

    fwrite(buf, 1, len, stderr);
}

static void dmesgFlushRaw() {
    fflush(dmesgFile);
#ifdef __linux__
    fdatasync(fileno(dmesgFile));
#else
    fsync(fileno(dmesgFile));
#endif
}

void vdmesg(const char *format, va_list arg) {
    char buf[500];

    snprintf(buf, sizeof(buf), "[%8d] ", current_time_ms());
    dmesgRaw(buf, strlen(buf));
    vsnprintf(buf, sizeof(buf), format, arg);
    dmesgRaw(buf, strlen(buf));
    dmesgRaw("\n", 1);

    dmesgFlushRaw();
}

void dmesg(const char *format, ...) {
    va_list arg;
    va_start(arg, format);
    vdmesg(format, arg);
    va_end(arg);
}

} // namespace pxt

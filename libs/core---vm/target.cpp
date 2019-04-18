#include "pxt.h"
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <stdarg.h>
#include <fcntl.h>

namespace pxt {

void target_exit() {
    kill(getpid(), SIGTERM);
}

extern "C" void target_reset() {
    for (int i = 3; i < 1000; ++i)
        close(i);
    if (!fork()) {
        execv(initialArgv[0], initialArgv);
        exit(127);
    } else {
        target_exit();
    }
}

void target_startup() {
    int pid = getpid();
    DMESG("runtime starting, pid=%d...", pid);

    FILE *pf = fopen("/tmp/pxt-pid", "r");
    if (pf) {
        int p2 = 0;
        fscanf(pf, "%d", &p2);
        if (p2)
            kill(p2, SIGTERM);
        fclose(pf);
    }
    pf = fopen("/tmp/pxt-pid", "w");
    fprintf(pf, "%d", pid);
    fclose(pf);
}

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
        dmesgFile = fopen("dmesg.txt", "w");
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

int getSerialNumber() {
    static int serial;

    if (serial)
        return serial;

    char buf[1024];
    int fd = open("/proc/cpuinfo", O_RDONLY);
    int len = read(fd, buf, sizeof(buf) - 1);
    close(fd);

    if (len < 0)
        len = 0;
    buf[len] = 0;
    auto p = strstr(buf, "Serial\t");
    if (p) {
        p += 6;
        while (*p && strchr(" \t:", *p))
            p++;
        uint64_t s = 0;
        sscanf(p, "%llu", &s);
        serial = (s >> 32) ^ (s);
    }

    if (!serial)
        serial = 0xf00d0042;

    return serial;
}

} // namespace pxt

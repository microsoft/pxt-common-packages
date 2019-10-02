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

uint64_t readSerialNumber() {
    static uint64_t bigSerialNumber;

    if (bigSerialNumber)
        return bigSerialNumber;

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
        bigSerialNumber = s;
    }

    if (!bigSerialNumber)
        bigSerialNumber = 0xf00d0042f00d0042;

    return bigSerialNumber;
}

uint64_t getLongSerialNumber() {
    static uint64_t serial;
    if (serial == 0)
        serial = readSerialNumber();
    return serial;
}

} // namespace pxt

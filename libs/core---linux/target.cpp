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

} // namespace pxt

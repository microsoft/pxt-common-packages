#ifndef __PXTCORE_H
#define __PXTCORE_H

#include <stdio.h>

namespace pxt {
void dmesg(const char *fmt, ...);
#define DMESG pxt::dmesg
}

static inline void itoa(int v, char *dst) {
    snprintf(dst, 30, "%d", v);
}

#endif

#ifndef __PXTCORE_H
#define __PXTCORE_H

#include <stdio.h>
#include <stdlib.h>

namespace pxt {
void dmesg(const char *fmt, ...);
#define DMESG pxt::dmesg
void *gcAllocBlock(size_t sz);
}

static inline void itoa(int v, char *dst) {
    snprintf(dst, 30, "%d", v);
}

#define PXT_USE_XMALLOC
extern "C" void *xmalloc(size_t sz);

#define GC_ALLOC_BLOCK gcAllocBlock

#ifndef POKY
// This seems to degrade performance - probably due to cache size
//#define GC_BLOCK_SIZE (1024 * 64)
#endif

#define PXT_HARD_FLOAT 1

#endif

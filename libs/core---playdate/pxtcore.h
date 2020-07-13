#ifndef __PXTCORE_H
#define __PXTCORE_H

#include "dmesg.h"
#include "CodalCompat.h"

extern "C" int itoa(int n, char *s);
extern "C" void *xmalloc(size_t sz);
#define xfree free

#define GC_MAX_ALLOC_SIZE (16 * 1024)

#endif

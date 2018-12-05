#ifndef __PXTCORE_H
#define __PXTCORE_H

#include "CodalDmesg.h"
#include "CodalHeapAllocator.h"

#define itoa(a, b) codal::itoa(a, b)

#define GC_GET_HEAP_SIZE() device_heap_size(0)
#define xmalloc malloc
#define xfree free

#define GC_MAX_ALLOC_SIZE (16 * 1024)

#endif

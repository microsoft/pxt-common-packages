#ifndef __PXTCORE_H
#define __PXTCORE_H

#include "CodalDmesg.h"
#include "CodalHeapAllocator.h"

#define PXT_CODAL 1

#define itoa(a, b) codal::itoa(a, b)

#define GC_GET_HEAP_SIZE() device_heap_size(0)
#define GC_STACK_BASE DEVICE_STACK_BASE
#define xmalloc device_malloc
#define xfree device_free

// on most devices we allocate the entire heap at once, so large allocs should work
// if they don't you just get the regular out of memory instead of alloc too large
#define GC_MAX_ALLOC_SIZE (128 * 1024)

#endif

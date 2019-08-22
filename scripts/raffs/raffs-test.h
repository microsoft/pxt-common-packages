#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <assert.h>

inline int min(int a, int b)
{
    return (a < b ? a : b);
}

inline int max(int a, int b)
{
    return (a > b ? a : b);
}

#define NOLOG(...) ((void)0)
#define DMESG(fmt, ...) printf(fmt "\n" , ## __VA_ARGS__)

//#define LOG NOLOG
#define LOG DMESG
#define LOGV NOLOG
//#define LOGV DMESG

#define target_panic(...) assert(false)
#define fiber_wait_for_event(...) assert(false)

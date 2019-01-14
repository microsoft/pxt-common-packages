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

//#define LOG(...) do{}while(0)
#define LOG printf

//#define LOGV printf
#define LOGV(...)                                                                                  \
    do                                                                                             \
    {                                                                                              \
    } while (0)

#define target_panic(...) assert(false)
#define fiber_wait_for_event(...) assert(false)

#ifndef __PXTCORE_H
#define __PXTCORE_H

#include <stdint.h>
#include <stdio.h>

#define ramint_t uint32_t
#define IMAGE_BITS 4

#define DMESG(...) do { printf(__VA_ARGS__); printf("\n"); } while(0)



#endif

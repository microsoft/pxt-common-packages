#pragma once

#include <stddef.h>

#ifndef DMESG
#ifdef __cplusplus
extern "C" void dmesg(const char *fmt, ...);
#define DMESG ::dmesg
#else // not C++
void dmesg(const char *fmt, ...);
#define DMESG dmesg
#endif
#endif

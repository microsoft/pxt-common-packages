#ifndef __PXTCORE_H
#define __PXTCORE_H

namespace pxt {
void dmesg(const char *fmt, ...);
#define DMESG pxt::dmesg
}

#endif

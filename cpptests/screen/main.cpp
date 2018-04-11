#include "pxt.h"
#include <stdlib.h>

extern "C" int main() {
    return 0;
}

void *operator new(size_t sz) {
    return malloc(sz);
}
void *operator new[](size_t sz) {
    return malloc(sz);
}
void operator delete(void *p) {
    free(p);
}

extern "C" void target_panic(int code){
    DMESG("PANIC %d", code);
    exit(1);
}
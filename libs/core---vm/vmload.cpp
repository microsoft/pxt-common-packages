#include "pxt.h"

namespace pxt {

void vmStart() {
    auto fn = pxt::initialArgv[1];
    auto f = fopen(fn, "r");
    if (!f) {
        printf("cannot open %s\n", fn);
        exit(1);
    }

    fseek(f, 0, SEEK_END);
    unsigned len = ftell(f);
    fseek(f, 0, SEEK_SET);
    auto data = new uint8_t[len];
    fread(data, len, 1, f);
    fclose(f);
    auto img = loadVMImage(data, len);
    if (img->errorCode) {
        printf("validation error %d at 0x%x\n", img->errorCode, img->errorOffset);
        exit(2);
    }
    exit(0);
}

} // namespace pxt
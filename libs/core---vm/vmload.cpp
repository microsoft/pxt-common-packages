#include "pxt.h"

namespace pxt {

VMImage *vmImg;

static void vmStartCore(const char *fn) {
    auto f = fopen(fn, "r");
    if (!f) {
        printf("cannot open %s\n", fn);
        exit(1);
    }

    fseek(f, 0, SEEK_END);
    unsigned len = ftell(f);
    fseek(f, 0, SEEK_SET);
    auto data = new uint8_t[len + 16];
    fread(data, len, 1, f);
    fclose(f);
    auto img = loadVMImage(data, len);
    if (img->errorCode) {
        printf("validation error %d at 0x%x\n", img->errorCode, img->errorOffset);
        exit(2);
    } else {
        printf("Validation OK\n");
    }
    vmImg = img;

    gcStartup();

    globals = (TValue *)app_alloc(sizeof(TValue) * getNumGlobals());
    memset(globals, 0, sizeof(TValue) * getNumGlobals());

    initRuntime();  // never returns

    exit(10);
}

void vmStart() {
    auto fn = pxt::initialArgv[1];
    vmStartCore(fn);
}

DLLEXPORT void pxt_vm_start(const char *fn)
{
    pthread_t disp;
    pthread_create(&disp, NULL, (void*(*)(void*))vmStartCore, (void*)fn);
    pthread_detach(disp);
}

} // namespace pxt
#include "pxt.h"

namespace pxt {

VMImage *vmImg;

static void vmStartCore(const char *fn) {
    auto f = fopen(fn, "rb");
    if (!f) {
        dmesg("cannot open %s", fn);
        return;
    }

    fseek(f, 0, SEEK_END);
    unsigned len = ftell(f);
    fseek(f, 0, SEEK_SET);
    auto data = new uint8_t[len + 16];
    fread(data, len, 1, f);
    fclose(f);

    unloadVMImage(vmImg);
    vmImg = NULL;

    gcPreStartup();

    auto img = loadVMImage(data, len);
    if (img->errorCode) {
        dmesg("validation error %d at 0x%x", img->errorCode, img->errorOffset);
        return;
    } else {
        dmesg("Validation OK");
    }
    vmImg = img;

    gcStartup();

    globals = (TValue *)app_alloc(sizeof(TValue) * getNumGlobals());
    memset(globals, 0, sizeof(TValue) * getNumGlobals());

    initRuntime();
}

void vmStart() {
    auto fn = pxt::initialArgv[1];
    vmStartCore(fn);
}

DLLEXPORT void pxt_vm_start(const char *fn)
{
    panicCode = 0;
    pthread_t disp;
    pthread_create(&disp, NULL, (void*(*)(void*))vmStartCore, (void*)fn);
    pthread_detach(disp);
}

} // namespace pxt
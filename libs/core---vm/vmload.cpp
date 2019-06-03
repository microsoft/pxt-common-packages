#include "pxt.h"

namespace pxt {

VMImage *vmImg;

static void vmStartCore(uint8_t *data, unsigned len) {
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

static void vmStartFile(const char *fn) {
    auto f = fopen(fn, "rb");
    if (!f) {
        dmesg("cannot open %s", fn);
        return;
    }

    fseek(f, 0, SEEK_END);
    auto len = (unsigned)ftell(f);
    fseek(f, 0, SEEK_SET);
    auto data = new uint8_t[len + 16];
    fread(data, len, 1, f);
    fclose(f);

    vmStartCore(data, len);
}

static uint8_t *vm_data;
static unsigned vm_len;
static const char *vm_filename;

static void *multiStart(void *) {
    if (vm_filename)
        vmStartFile(vm_filename);
    else
        vmStartCore(vm_data, vm_len);
    return NULL;
}

void vmStart() {
    auto fn = pxt::initialArgv[1];
    vmStartFile(fn);
}

static void spinThread() {
    panicCode = 0;
    pthread_t disp;
    pthread_create(&disp, NULL, multiStart, NULL);
    pthread_detach(disp);
}

DLLEXPORT void pxt_vm_start(const char *fn) {
    vm_filename = fn;
    spinThread();
}

DLLEXPORT void pxt_vm_start_buffer(uint8_t *data, unsigned len) {
    vm_filename = NULL;
    vm_data = data;
    vm_len = len;
    spinThread();
}

} // namespace pxt

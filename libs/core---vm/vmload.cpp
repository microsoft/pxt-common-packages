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
    auto data = (uint8_t*)malloc(len + 16);
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

pthread_t vm_thread;
int vm_has_thread;

static void spinThread() {
    if (vm_has_thread) {
        void *dummy;
        if (!panicCode)
            panicCode = -1;
        pthread_join(vm_thread, &dummy);
        vm_has_thread = 0;
    }
    panicCode = 0;
    pthread_create(&vm_thread, NULL, multiStart, NULL);
    vm_has_thread = 1;
}

static void *startFromUserWorker(void *fn) {
    void *dummy;
    pthread_join(vm_thread, &dummy);
    vm_thread = pthread_self();
    panicCode = 0;
    vmStartFile((char*)fn);
    return NULL;
}

static const char *lastFN;
void vmStartFromUser(const char *fn) {
    pthread_t pt;
    if (!fn && lastFN) {
        dmesg("re-starting %s", lastFN);
        fn = lastFN;
    }
    lastFN = fn;
    if (fn)
        pthread_create(&pt, NULL, startFromUserWorker, (void*)fn);
    systemReset();
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

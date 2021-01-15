#include "pxt.h"

#define PXT_EXPORT(p) (uintptr_t)(void *)(p)
extern "C" {
__attribute__((used)) __attribute__((aligned(0x20))) const uintptr_t PXT_EXPORTData[] = {
    0x08010801,
    0x42424242,
    0x08010801,
    0x8de9d83e,
    PXT_EXPORT(&pxt::buffer_vt),
    PXT_EXPORT(&pxt::RefAction_vtable),
    PXT_EXPORT(&pxt::string_inline_ascii_vt),
    PXT_EXPORT(&pxt::string_skiplist16_packed_vt),
    PXT_EXPORT(&pxt::string_inline_utf8_vt),
    PXT_EXPORT(pxt::RefRecord_destroy),
    PXT_EXPORT(pxt::RefRecord_print),
    PXT_EXPORT(pxt::RefRecord_scan),
    PXT_EXPORT(pxt::RefRecord_gcsize),
    PXT_EXPORT(0),
};
}

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

void vmStart() {
    dmesg("vmptrs %p", PXT_EXPORTData); // make sure we use the pointer; __attribute__((used)) doesn't seem to work

    auto sect = (VMImageSection *)0x3ff00000;
    auto hd = (VMImageHeader *)sect->data;
    if (sect->type != SectionType::InfoHeader || hd->magic0 == VM_MAGIC0 || hd->imageSize < 256) {
        dmesg("invalid image at %p", sect);
        return;
    }

    vmStartCore((uint8_t *)sect, hd->imageSize);
}

//% expose
void updateScreen(Image_ img) {
    // dummy
}

} // namespace pxt
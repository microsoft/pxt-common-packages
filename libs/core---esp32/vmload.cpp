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

void vmStart() {
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
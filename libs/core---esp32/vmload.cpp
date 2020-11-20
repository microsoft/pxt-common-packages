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
    VMImage *hd = (VMImageHeader *)0x3ff00000; // TODO
    int len = 1024 * 4;                        // TODO hd->size
    vmStartCore((uint8_t *)hd, len);
}

} // namespace pxt
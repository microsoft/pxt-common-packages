#include "pxt.h"

namespace pxt {

#if CONFIG_ENABLED(DEVICE_USB)
CodalUSB usb;
HF2 hf2;

// TODO extract these from uf2_info()?
static const char *string_descriptors[] = {
    "Example Corp.",
    "PXT Device",
    "42424242",
};

static void start_usb() {
    // start USB with a delay, so that user code can add new interfaces if needed
    // (eg USB HID keyboard, or MSC)
    fiber_sleep(100);
    usb.start();
}

void usb_init() {
    usb.stringDescriptors = string_descriptors;
    usb.add(hf2);
    create_fiber(start_usb);
}

void dumpDmesg() {
    hf2.sendSerial("\nDMESG:\n", 8);
    hf2.sendSerial(codalLogStore.buffer, codalLogStore.ptr);
    hf2.sendSerial("\n\n", 2);
}

void sendSerial(const char *data, int len) {
    hf2.sendSerial(data, len);
}

#else
void usb_init() {}
void dumpDmesg() {}
void sendSerial(const char *data, int len) {}
#endif
}

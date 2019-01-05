#include "pxt.h"

namespace pxt {

#if CONFIG_ENABLED(DEVICE_USB)
CodalUSB usb;

// share the buffer; we will crash anyway if someone talks to us over both at the same time
HF2_Buffer hf2buf;
HF2 hf2(hf2buf);
DummyIface dummyIface;

#if CONFIG_ENABLED(DEVICE_MOUSE)
USBHIDMouse mouse;
#endif
#if CONFIG_ENABLED(DEVICE_KEYBOARD)
USBHIDKeyboard keyboard;
#endif
#if CONFIG_ENABLED(DEVICE_JOYSTICK)
USBHIDJoystick joystick;
#endif

static const DeviceDescriptor device_desc = {
    0x12,   // bLength
    0x01,   // bDescriptorType
    0x0210, // bcdUSBL

    // Class etc specified per-interface
    0x00, 0x00, 0x00,

    0x40, // bMaxPacketSize0
    USB_DEFAULT_VID, USB_DEFAULT_PID,
    0x4202, // bcdDevice - leave unchanged for the HF2 to work
    0x01,   // iManufacturer
    0x02,   // iProduct
    0x03,   // SerialNumber
    0x01    // bNumConfigs
};

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

void platform_usb_init() __attribute__((weak));
void platform_usb_init() {}

void usb_init() {
    usb.stringDescriptors = string_descriptors;
    usb.deviceDescriptor = &device_desc;

    platform_usb_init();

#if CONFIG_ENABLED(DEVICE_MOUSE)
    usb.add(mouse);
#endif
#if CONFIG_ENABLED(DEVICE_KEYBOARD)
    usb.add(keyboard);
#endif
#if CONFIG_ENABLED(DEVICE_JOYSTICK)
    usb.add(joystick);
#endif
    // the WINUSB descriptors don't seem to work if there's only one interface
    // so we add a dummy interface first
    usb.add(dummyIface);
    // let's not waste EPs on the HF2 - it will run on CONTROL pipe instead
    hf2.allocateEP = false;
    usb.add(hf2);
    create_fiber(start_usb);
}

#else
void usb_init() {}
#endif

static void (*pSendToUART)(const char *data, int len) = NULL;
void setSendToUART(void (*f)(const char *, int)) {
    pSendToUART = f;
}

void sendSerial(const char *data, int len) {
#if CONFIG_ENABLED(DEVICE_USB)
    hf2.sendSerial(data, len);
#endif
    if (pSendToUART)
        pSendToUART(data, len);
}

void dumpDmesg() {
    sendSerial("\nDMESG:\n", 8);
    sendSerial(codalLogStore.buffer, codalLogStore.ptr);
    sendSerial("\n\n", 2);
}
} // namespace pxt

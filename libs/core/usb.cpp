#include "pxt.h"

#if CONFIG_ENABLED(DEVICE_USB)
#include "uf2format.h"

namespace pxt {
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

static void start_usb() {
    // start USB with a delay, so that user code can add new interfaces if needed
    // (eg USB HID keyboard, or MSC)
    fiber_sleep(100);
    usb.start();
}

void platform_usb_init() __attribute__((weak));
void platform_usb_init() {}

void set_usb_strings(const char *uf2_info) {
    static const char *string_descriptors[3];
    static char serial[12];
    itoa(target_get_serial() & 0x7fffffff, serial);

    auto model = strstr(uf2_info, "Model: ");
    if (model) {
        model += 7;
        auto end = model;
        while (*end && *end != '\n' && *end != '\r')
            end++;
        auto len = end - model;
        auto dev = (char *)app_alloc(len + 10);
        memcpy(dev, model, len);
        strcpy(dev + len, " (app)");
        // try to split into manufacturer and
        auto sep = strstr(dev, " / ");
        if (sep) {
            *sep = '\0';
            string_descriptors[0] = dev;
            string_descriptors[1] = sep + 3;
        } else {
            string_descriptors[0] = dev;
            string_descriptors[1] = dev;
        }
    }

    string_descriptors[2] = serial;
    usb.stringDescriptors = string_descriptors;
}

void usb_init() {
    usb.deviceDescriptor = &device_desc;
    set_usb_strings(UF2_INFO_TXT);

    platform_usb_init();

#ifdef STM32F4
    // as long as we don't enable MSC here, put dummy in its place
    dummyIface.interfaceIdx = 0x00;
    hf2.interfaceIdx = 0x01;
#endif

    // the WINUSB descriptors don't seem to work if there's only one interface
    // so we add a dummy interface first
    usb.add(dummyIface);

#ifdef STM32F4
    // let's not waste EPs on the HF2 - it will run on CONTROL pipe instead
    // this doesn't seem to currently work on SAMD, so only do it on STM, which
    // has very few EPs
    hf2.allocateEP = false;
#endif
    usb.add(hf2);

#if CONFIG_ENABLED(DEVICE_MOUSE)
    usb.add(mouse);
#endif
#if CONFIG_ENABLED(DEVICE_KEYBOARD)
    usb.add(keyboard);
#endif
#if CONFIG_ENABLED(DEVICE_JOYSTICK)
    usb.add(joystick);
#endif

    create_fiber(start_usb);
}

} // namespace pxt

#else
namespace pxt {
void usb_init() {}
} // namespace pxt
#endif

namespace pxt {
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

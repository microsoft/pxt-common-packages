#include "pxt.h"
#include "serial-target.h"

namespace serial {

static SerialDevice serialDevices(NULL);
/**
 * Opens a Serial communication driver
 */
//%
SerialDevice internalCreateSerialDevice(DigitalInOutPin tx, DigitalInOutPin rx, int id) {
    auto dev = serialDevices;
    while (dev) {
        if (dev->matchPins(tx, rx))
            return dev;
        dev = dev->next;
    }

    // allocate new one
    auto ser = new CodalSerialDeviceProxy(tx, rx, id);
    ser->next = serialDevices;
    serialDevices = ser;
    return ser;
}

} // namespace serial

namespace SerialDeviceMethods {

/**
 */
//%
void redirect(SerialDevice device, DigitalInOutPin tx, DigitalInOutPin rx, BaudRate rate) {
    device->redirect(tx, rx, rate);
}

} // namespace SerialDeviceMethods

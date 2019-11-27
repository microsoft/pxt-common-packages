#include "pxt.h"

namespace control {

/**
 * Announce that an event happened to registered handlers.
 * @param src ID of the Component that generated the event
 * @param value Component specific code indicating the cause of the event.
 * @param mode optional definition of how the event should be processed after construction.
 */
//% weight=21 blockGap=12 blockId="control_raise_event"
//% block="raise event|from %src|with value %value" blockExternalInputs=1
//% help=control/raise-event
void raiseEvent(int src, int value) {
    pxt::raiseEvent(src, value);
}

/**
* Allocates the next user notification event
*/
//% help=control/allocate-notify-event
int allocateNotifyEvent() {
    return pxt::allocateNotifyEvent();
}

/**
* Determine the version of system software currently running.
*/
//% blockId="control_device_dal_version" block="device dal version"
//% help=control/device-dal-version
String deviceDalVersion() {
#ifdef PXT_VM
    return mkString("vm");
#else
    return mkString("linux");
#endif
}


/** Write data to DMESG debugging buffer. */
//%
void dmesg(String s) {
    DMESG("# %s", s->getUTF8Data());
}

//%
uint32_t _ramSize()
{
#ifdef POKY
    return 128 * 1024;
#else
    // a lot! doesn't really matter how much
    return 16 * 1024 * 1024;
#endif
}

/**
 * Determines if the USB has been enumerated.
 */
//%
bool isUSBInitialized() {
    return false;
}

}

namespace serial {
    /** Send DMESG debug buffer over serial. */
    //%
    void writeDmesg() {
        pxt::dumpDmesg();
    }
}
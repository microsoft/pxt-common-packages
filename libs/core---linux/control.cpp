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

/** Write data to DMESG debugging buffer. */
//%
void dmesg(String s) {
    DMESG("# %s", s->getUTF8Data());
}

}

namespace serial {
    /** Send DMESG debug buffer over serial. */
    //%
    void writeDmesg() {
        pxt::dumpDmesg();
    }
}
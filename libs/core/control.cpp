#include "pxt.h"

/**
 * How to create the event.
 */
enum class EventCreationMode {
    /**
     * Event is initialised, and its event handlers are immediately fired (not suitable for use in
     * interrupts!).
     */
    CreateAndFire = CREATE_AND_FIRE,
    /**
     * Event is initialised, and no further processing takes place.
     */
    CreateOnly = CREATE_ONLY,
};

namespace control {

/**
 * Announce that an event happened to registered handlers.
 * @param src ID of the MicroBit Component that generated the event
 * @param value Component specific code indicating the cause of the event.
 * @param mode optional definition of how the event should be processed after construction.
 */
//% weight=21 blockGap=12 blockId="control_raise_event"
//% help=control/raise-event
//% block="raise event|from %src|with value %value" blockExternalInputs=1
//% mode.defl=CREATE_AND_FIRE
void raiseEvent(int src, int value, EventCreationMode mode) {
    Event evt(src, value, (EventLaunchMode)mode);
}

/**
* Determine the version of system software currently running.
*/
//% blockId="control_device_dal_version" block="device dal version"
//% help=control/device-dal-version
String deviceDalVersion() {
    return mkString(device.getVersion());
}

/**
* Allocates the next user notification event
*/
//% help=control/allocate-notify-event
int allocateNotifyEvent() {
    return ::allocateNotifyEvent();
}
}

#include "pxt.h"

/**
 * How to create the event.
 */
enum class EventCreationMode {
    /**
     * Event is initialised, and its event handlers are immediately fired (not suitable for use in interrupts!).
     */
    CreateAndFire = CREATE_AND_FIRE,
    /**
     * Event is initialised, and no further processing takes place.
     */
    CreateOnly = CREATE_ONLY,
};

namespace control {
    /**
    * Gets the number of milliseconds elapsed since power on.
    */
    //% help=control/millis weight=50
    //% blockId=control_running_time block="millis (ms)"
    int millis() {
        return system_timer_current_time();
    }

    /**
     * Announce that an event happened to registered handlers.
     * @param src ID of the MicroBit Component that generated the event
     * @param value Component specific code indicating the cause of the event.
     * @param mode optional definition of how the event should be processed after construction.
     */
    //% weight=21 blockGap=12 blockId="control_raise_event" block="raise event|from %src|with value %value" blockExternalInputs=1
    //% mode.defl=CREATE_AND_FIRE
    void raiseEvent(int src, int value, EventCreationMode mode) {
        Event evt(src, value, (EventLaunchMode)mode);
    }

    /**
     * Run code when a registered event happens.
     * @param id the event compoent id
     * @param value the event value to match
     */
    //% weight=20 blockGap=8 blockId="control_on_event" block="on event|from %src|with value %value"
    //% blockExternalInputs=1
    //% help="control/on-event"
    void onEvent(int src, int value, Action handler) {
        registerWithDal(src, value, handler);
    }    

    /**
     * Reset the device.
     */
    //% weight=30 async help=control/reset blockGap=8
    //% blockId="control_reset" block="reset"
    void reset() {
        target_reset();
    }

    /**
    * Block the current fiber for the given microseconds
    * @param micros number of micro-seconds to wait. eg: 4
    */
    //% help=control/wait-micros weight=29 async
    //% blockId="control_wait_us" block="wait (µs)%micros"
    void waitMicros(int micros) {
        wait_us(micros);
    }  

    /**
     * Run other code in the background.
     */
    //% help=control/run-in-background blockAllowMultiple=1
    //% blockId="control_run_in_background" block="run in background" blockGap=8
    void runInBackground(Action a) {
      pxt::runInBackground(a);
    }   

    /**
    * Blocks the calling thread until the specified event is raised.
    */
    //% help=control/wait-for-event async
    //% blockId=control_wait_for_event block="wait for event|from %src|with value %value"
    void waitForEvent(int src, int value) {
        pxt::waitForEvent(src, value);
    }   

    /**
    * Allocates the next user notification event
    */
    //% help=control/allocate-notify-event
    //%
    int allocateNotifyEvent() {
        return ::allocateNotifyEvent();
    }

    /**
    * Derive a unique, consistent serial number of this device from internal data.
    */
    //% blockId="control_device_serial_number" block="device serial number" weight=9
    int deviceSerialNumber() {
        return device.getSerialNumber();
    }

    /**
    * Determine the version of system software currently running.
    */
    //%
    StringData* deviceDalVersion() {
        return ManagedString(device.getVersion()).leakData();
    }
}

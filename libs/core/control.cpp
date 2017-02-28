#include "pxt.h"
#include "DeviceSystemTimer.h"

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

/**
* Runtime and event utilities.
*/
//% weight=70 color="#BEAA07" icon="\uf110"
namespace control {

    void forever_stub(void *a) {
      while (true) {
        runAction0((Action)a);
        fiber_sleep(20);
      }
    }

    /**
     * Repeats the code forever in the background. On each iteration, allows other codes to run.
     * @param body code to execute
     */
    //% help=control/forever weight=100 blockGap=8
    //% blockId=forever block="forever"
    void forever(Action a) {
      if (a != 0) {
        incr(a);
        create_fiber(forever_stub, (void*)a);
      }
    }
    
    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=control/pause weight=99
    //% async block="pause (ms) %pause"
    //% blockId=device_pause
    void pause(int ms) {
      fiber_sleep(ms);
    }


    /**
    * Gets the number of milliseconds elapsed since power on.
    */
    //% help=control/millis weight=50
    //% blockId=control_running_time block="millis (ms)"
    int millis() {
        return system_timer_current_time();
    }

    /**
     * Raises an event in the event bus.
     * @param src ID of the MicroBit Component that generated the event
     * @param value Component specific code indicating the cause of the event.
     * @param mode optional definition of how the event should be processed after construction.
     */
    //% weight=21 blockGap=12 blockId="control_raise_event" block="raise event|from %src|with value %value" blockExternalInputs=1
    //% mode.defl=CREATE_AND_FIRE advanced=true
    void raiseEvent(int src, int value, EventCreationMode mode) {
        DeviceEvent evt(src, value, (DeviceEventLaunchMode)mode);
    }

    /**
     * Raises an event in the event bus.
     * @param id the event compoent id
     * @param value the event value to match
     */
    //% weight=20 blockGap=8 blockId="control_on_event" block="on event|from %src|with value %value"
    //% blockExternalInputs=1 advanced=true
    void onEvent(int id, int value, Action handler) {
        registerWithDal(id, value, handler);
    }    

    /**
     * Resets the device.
     */
    //% weight=30 async help=control/reset blockGap=8
    //% blockId="control_reset" block="reset"
    void reset() {
      device.reset();
    }

    /**
    * Blocks the current fiber for the given microseconds
    * @param micros number of micro-seconds to wait. eg: 4
    */
    //% help=control/wait-micros weight=29
    //% blockId="control_wait_us" block="wait (µs)%micros" advanced=true
    void waitMicros(int micros) {
        wait_us(micros);
    }  

    /**
     * Schedules code that run in the background.
     */
    //% help=control/run-in-background blockAllowMultiple=1 advanced=true
    //% blockId="control_run_in_background" block="run in background" blockGap=8
    void runInBackground(Action a) {
      pxt::runInBackground(a);
    }      

    /**
    * Derive a unique, consistent serial number of this device from internal data.
    */
    //% blockId="control_device_serial_number" block="device serial number" weight=9
    //% advanced=true
    int deviceSerialNumber() {
        return device.getSerialNumber();
    }

    /**
    * Determine the version of system software currently running.
    */
    //%
    StringData* deviceDalVersion() {
        return ManagedString(device.device_dal_version()).leakData();
    }
}

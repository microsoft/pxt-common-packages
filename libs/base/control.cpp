#include "pxtbase.h"

// enum EventBusSource {
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_BUTTON_A_ = MICROBIT_ID_BUTTON_A,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_BUTTON_B_ = MICROBIT_ID_BUTTON_B,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_BUTTON_AB_ = MICROBIT_ID_BUTTON_AB,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_RADIO_ = MICROBIT_ID_RADIO,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_GESTURE_ = MICROBIT_ID_GESTURE,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_ACCELEROMETER_ = MICROBIT_ID_ACCELEROMETER,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P0_ = MICROBIT_ID_IO_P0,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P1_ = MICROBIT_ID_IO_P1,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P2_ = MICROBIT_ID_IO_P2,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P3_ = MICROBIT_ID_IO_P3,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P4_ = MICROBIT_ID_IO_P4,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P5_ = MICROBIT_ID_IO_P5,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P6_ = MICROBIT_ID_IO_P6,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P7_ = MICROBIT_ID_IO_P7,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P8_ = MICROBIT_ID_IO_P8,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P9_ = MICROBIT_ID_IO_P9,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P10_ = MICROBIT_ID_IO_P10,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P11_ = MICROBIT_ID_IO_P11,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P12_ = MICROBIT_ID_IO_P12,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P13_ = MICROBIT_ID_IO_P13,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P14_ = MICROBIT_ID_IO_P14,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P15_ = MICROBIT_ID_IO_P15,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P16_ = MICROBIT_ID_IO_P16,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P19_ = MICROBIT_ID_IO_P19,
//     //% blockIdentity="control.eventSourceId"
//     MICROBIT_ID_IO_P20_ = MICROBIT_ID_IO_P20,
//     //% blockIdentity="control.eventSourceId"
//     MES_DEVICE_INFO_ID_ = MES_DEVICE_INFO_ID,
//     //% blockIdentity="control.eventSourceId"
//     MES_SIGNAL_STRENGTH_ID_ = MES_SIGNAL_STRENGTH_ID,
//     //% blockIdentity="control.eventSourceId"
//     MES_DPAD_CONTROLLER_ID_ = MES_DPAD_CONTROLLER_ID,
//     //% blockIdentity="control.eventSourceId"
//     MES_BROADCAST_GENERAL_ID_ = MES_BROADCAST_GENERAL_ID,
// };

// enum EventBusValue {
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_EVT_ANY_ = MICROBIT_EVT_ANY,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_BUTTON_EVT_DOWN_ = MICROBIT_BUTTON_EVT_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_BUTTON_EVT_UP_ = MICROBIT_BUTTON_EVT_UP,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_BUTTON_EVT_CLICK_ = MICROBIT_BUTTON_EVT_CLICK,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_RADIO_EVT_DATAGRAM_ = MICROBIT_RADIO_EVT_DATAGRAM,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_ACCELEROMETER_EVT_DATA_UPDATE_ = MICROBIT_ACCELEROMETER_EVT_DATA_UPDATE,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_PIN_EVT_RISE_ = MICROBIT_PIN_EVT_RISE,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_PIN_EVT_FALL_ = MICROBIT_PIN_EVT_FALL,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_PIN_EVT_PULSE_HI_ = MICROBIT_PIN_EVT_PULSE_HI,
//     //% blockIdentity="control.eventValueId"
//     MICROBIT_PIN_EVT_PULSE_LO_ = MICROBIT_PIN_EVT_PULSE_LO,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_ALARM1_ = MES_ALERT_EVT_ALARM1,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_ALARM2_ = MES_ALERT_EVT_ALARM2,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_ALARM3_ = MES_ALERT_EVT_ALARM3,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_ALARM4_ = MES_ALERT_EVT_ALARM4,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_ALARM5_ = MES_ALERT_EVT_ALARM5,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_ALARM6_ = MES_ALERT_EVT_ALARM6,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_DISPLAY_TOAST_ = MES_ALERT_EVT_DISPLAY_TOAST,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_FIND_MY_PHONE_ = MES_ALERT_EVT_FIND_MY_PHONE,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_PLAY_RINGTONE_ = MES_ALERT_EVT_PLAY_RINGTONE,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_PLAY_SOUND_ = MES_ALERT_EVT_PLAY_SOUND,
//     //% blockIdentity="control.eventValueId"
//     MES_ALERT_EVT_VIBRATE_ = MES_ALERT_EVT_VIBRATE,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_LAUNCH_PHOTO_MODE_ = MES_CAMERA_EVT_LAUNCH_PHOTO_MODE,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_LAUNCH_VIDEO_MODE_ = MES_CAMERA_EVT_LAUNCH_VIDEO_MODE,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_START_VIDEO_CAPTURE_ = MES_CAMERA_EVT_START_VIDEO_CAPTURE,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_STOP_PHOTO_MODE_ = MES_CAMERA_EVT_STOP_PHOTO_MODE,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_STOP_VIDEO_CAPTURE_ = MES_CAMERA_EVT_STOP_VIDEO_CAPTURE,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_STOP_VIDEO_MODE_ = MES_CAMERA_EVT_STOP_VIDEO_MODE,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_TAKE_PHOTO_ = MES_CAMERA_EVT_TAKE_PHOTO,
//     //% blockIdentity="control.eventValueId"
//     MES_CAMERA_EVT_TOGGLE_FRONT_REAR_ = MES_CAMERA_EVT_TOGGLE_FRONT_REAR,
//     //% blockIdentity="control.eventValueId"
//     MES_DEVICE_DISPLAY_OFF_ = MES_DEVICE_DISPLAY_OFF,
//     //% blockIdentity="control.eventValueId"
//     MES_DEVICE_DISPLAY_ON_ = MES_DEVICE_DISPLAY_ON,
//     //% blockIdentity="control.eventValueId"
//     MES_DEVICE_GESTURE_DEVICE_SHAKEN_ = MES_DEVICE_GESTURE_DEVICE_SHAKEN,
//     //% blockIdentity="control.eventValueId"
//     MES_DEVICE_INCOMING_CALL_ = MES_DEVICE_INCOMING_CALL,
//     //% blockIdentity="control.eventValueId"
//     MES_DEVICE_INCOMING_MESSAGE_ = MES_DEVICE_INCOMING_MESSAGE,
//     //% blockIdentity="control.eventValueId"
//     MES_DEVICE_ORIENTATION_LANDSCAPE_ = MES_DEVICE_ORIENTATION_LANDSCAPE,
//     //% blockIdentity="control.eventValueId"
//     MES_DEVICE_ORIENTATION_PORTRAIT_ = MES_DEVICE_ORIENTATION_PORTRAIT,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_1_DOWN_ = MES_DPAD_BUTTON_1_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_1_UP_ = MES_DPAD_BUTTON_1_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_2_DOWN_ = MES_DPAD_BUTTON_2_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_2_UP_ = MES_DPAD_BUTTON_2_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_3_DOWN_ = MES_DPAD_BUTTON_3_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_3_UP_ = MES_DPAD_BUTTON_3_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_4_DOWN_ = MES_DPAD_BUTTON_4_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_4_UP_ = MES_DPAD_BUTTON_4_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_A_DOWN_ = MES_DPAD_BUTTON_A_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_A_UP_ = MES_DPAD_BUTTON_A_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_B_DOWN_ = MES_DPAD_BUTTON_B_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_B_UP_ = MES_DPAD_BUTTON_B_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_C_DOWN_ = MES_DPAD_BUTTON_C_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_C_UP_ = MES_DPAD_BUTTON_C_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_D_DOWN_ = MES_DPAD_BUTTON_D_DOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_DPAD_BUTTON_D_UP_ = MES_DPAD_BUTTON_D_UP,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_FORWARD_ = MES_REMOTE_CONTROL_EVT_FORWARD,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_NEXTTRACK_ = MES_REMOTE_CONTROL_EVT_NEXTTRACK,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_PAUSE_ = MES_REMOTE_CONTROL_EVT_PAUSE,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_PLAY_ = MES_REMOTE_CONTROL_EVT_PLAY,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_PREVTRACK_ = MES_REMOTE_CONTROL_EVT_PREVTRACK,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_REWIND_ = MES_REMOTE_CONTROL_EVT_REWIND,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_STOP_ = MES_REMOTE_CONTROL_EVT_STOP,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_VOLUMEDOWN_ = MES_REMOTE_CONTROL_EVT_VOLUMEDOWN,
//     //% blockIdentity="control.eventValueId"
//     MES_REMOTE_CONTROL_EVT_VOLUMEUP_ = MES_REMOTE_CONTROL_EVT_VOLUMEUP,
// };

namespace control {
    /**
    * Gets the number of milliseconds elapsed since power on.
    */
    //% help=control/millis weight=50
    //% blockId=control_running_time block="millis (ms)"
    int millis() {
        return current_time_ms();
    }

    /**
    * Gets current time in microseconds. Overflows every ~18 minutes.
    */
    //%
    int micros() {
        return current_time_us() & 0x3fffffff;
    }

    /**
    * Used internally
    */
    //%
    void internalOnEvent(int src, int value, Action handler, int flags = 16) {
        registerWithDal(src, value, handler, flags);
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
        sleep_us(micros);
    }

    /**
     * Run other code in the parallel.
     */
    //% help=control/run-in-parallel handlerStatement=1
    //% blockId="control_run_in_parallel" block="run in parallel" blockGap=8
    void runInParallel(Action a) {
        pxt::runInParallel(a);
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
    * Derive a unique, consistent serial number of this device from internal data.
    */
    //% blockId="control_device_serial_number" block="device serial number" weight=9
    //% help=control/device-serial-number
    int deviceSerialNumber() {
        uint64_t serial_num = pxt::getLongSerialNumber();
        return hash_fnv1(&serial_num, sizeof(serial_num)) & 0x3fffffff;
    }

    /**
    * Derive a unique, consistent 64-bit serial number of this device from internal data.
    */
    //% blockId="control_device_long_serial_number" block="device long serial number" weight=9
    //% help=control/device-long-serial-number
    Buffer deviceLongSerialNumber() {
        uint64_t serial_num = pxt::getLongSerialNumber();
        return mkBuffer((uint8_t*)&serial_num, sizeof(uint64_t));
    }

    /**
    *
    */
    //%
    void __log(int prority, String text) {
        if (NULL == text) return;
        pxt::sendSerial(text->getUTF8Data(), text->getUTF8Size());
    }

    /**
     * Dump internal information about a value.
     */
    //%
    void dmesgValue(TValue v) {
        anyPrint(v);
    }
}

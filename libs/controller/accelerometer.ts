enum ControllerGesture {
    /**
     * Shake gesture
     */
    //% block="shake"
    Shake = 11,  // ACCELEROMETER_EVT_SHAKE
    /**
     * Raised when the device tilts up
     */
    //% block="tilt up"
    TiltUp = 1,  // ACCELEROMETER_EVT_TILT_UP
    /**
     * Raised when the device tilts down
     */
    //% block="tilt down"
    TiltDown = 2,  // ACCELEROMETER_EVT_TILT_DOWN
    /**
     * Raised when the screen is pointing left
     */
    //% block="tilt left"
    TiltLeft = 3,  // ACCELEROMETER_EVT_TILT_LEFT
    /**
     * Raised when the screen is pointing right
     */
    //% block="tilt right"
    TiltRight = 4,  // ACCELEROMETER_EVT_TILT_RIGHT
    /**
     * Raised when the screen faces up
     */
    //% block="screen up"
    ScreenUp = 5,  // ACCELEROMETER_EVT_FACE_UP
    /**
     * Raised when the screen is pointing up and the board is horizontal
     */
    //% block="screen down"
    ScreenDown = 6,  // ACCELEROMETER_EVT_FACE_DOWN
    /**
     * Raised when a 2G shock is detected
     */
    //% block="2g (step)"
    TwoG = 12,  // ACCELEROMETER_EVT_2G
    /**
     * Raised when a 3G shock is detected
     */
    //% block="3g"
    ThreeG = 8,  // ACCELEROMETER_EVT_3G
    /**
     * Raised when a 6G shock is detected
     */
    //% block="6g"
    SixG = 9,  // ACCELEROMETER_EVT_6G
    /**
     * Raised when a 8G shock is detected
     */
    //% block="8g"
    EightG = 10,  // ACCELEROMETER_EVT_8G
}

enum ControllerDimension {
    //% block=x
    X = 0,
    //% block=y
    Y = 1,
    //% block=z
    Z = 2,
    //% block=strength
    Strength = 3,
}

namespace controller {
    /**
     * Do something when a gesture happens (like shaking the board).
     * @param gesture the type of gesture to track
     * @param body code to run when gesture is raised
     */
    //% blockId=ctrlongesture block="on |%NAME"
    //% parts="accelerometer"
    //% gesture.fieldEditor="gridpicker"
    //% gesture.fieldOptions.width=220
    //% gesture.fieldOptions.columns=3
    //% group="Extras"
    export function onGesture(gesture: ControllerGesture, handler: () => void) {
        controller.__internal.onGesture(gesture, handler);
    }

    /**
     * Register a custom gesture for the controller
     * @param id 
     * @param update
     * @param handler
     */
    export function onCustomGesture(id: number, update: () => boolean, handler: () => void) {
        controller.__internal.onCustomGesture(id, update, handler);
    }

    /**
     * Get the acceleration value in milli-gravitys (when the board is laying flat with the screen up,
     * x=0, y=0 and z=-1023)
     * @param dimension the axis along which the acceleration if measured
     */
    //% blockId=ctrlaccelerationvalue block="acceleration (mg)|%NAME"
    //% parts="accelerometer"
    //% dimension.fieldEditor="gridpicker"
    //% dimension.fieldOptions.width=180
    //% dimension.fieldOptions.columns=2
    //% group="Extras"
    export function acceleration(dimension: ControllerDimension): number {
        return controller.__internal.acceleration(dimension);
    }
}
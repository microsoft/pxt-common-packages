enum ControllerGesture {
    /**
     * Shake gesture
     */
    //% block="shake"
    Shake = Gesture.Shake,
    /**
     * Raised when the device tilts up
     */
    //% block="tilt up"
    TiltUp = Gesture.TiltUp,  // ACCELEROMETER_EVT_TILT_UP
    /**
     * Raised when the device tilts down
     */
    //% block="tilt down"
    TiltDown = Gesture.TiltDown,  // ACCELEROMETER_EVT_TILT_DOWN
    /**
     * Raised when the screen is pointing left
     */
    //% block="tilt left"
    TiltLeft = Gesture.TiltLeft,  // ACCELEROMETER_EVT_TILT_LEFT
    /**
     * Raised when the screen is pointing right
     */
    //% block="tilt right"
    TiltRight = Gesture.TiltRight,  // ACCELEROMETER_EVT_TILT_RIGHT
    /**
     * Raised when the screen faces up
     */
    //% block="screen up"
    ScreenUp = Gesture.FaceUp,  // ACCELEROMETER_EVT_FACE_UP
    /**
     * Raised when the screen is pointing up and the board is horizontal
     */
    //% block="screen down"
    ScreenDown = Gesture.FaceDown,  // ACCELEROMETER_EVT_FACE_DOWN
}

enum ControllerDimension {
    //% block=x
    X = Dimension.X,
    //% block=y
    Y = Dimension.Y,
    //% block=z
    Z = Dimension.Z,
    //% block=strength
    Strength = Dimension.Strength
}

namespace controller {
    interface ControllerAccelerometerState {
        lastGesture: ControllerGesture;
        gestureHandlers: any;
    }

    function sceneState(): ControllerAccelerometerState {
        const sc = game.currentScene();
        let state = sc.data["controller.accelerometer"];
        if (!state) {
            state = sc.data["controller.accelerometer"] = <ControllerAccelerometerState>{
                lastGesture: undefined,
                gestureHandlers: undefined
            };
        }
        return state;
    }

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
        const state = sceneState();
        if (!state.gestureHandlers) state.gestureHandlers = {};
        state.gestureHandlers[gesture] = handler;
        input.onGesture(<Gesture><number>gesture, () => {
            state.lastGesture = gesture;
        })
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
        return input.acceleration(<Dimension><number>dimension);
    }

    function updateGesture() {
        const state = sceneState();
        if (state && state.gestureHandlers && state.lastGesture !== undefined && state.gestureHandlers[lastGesture]) {
            const handler = state.gestureHandlers[state.lastGesture];
            state.lastGesture = undefined;
            handler();
        }
    }

    function initAccelerometer(s: scene.Scene) {
        s.eventContext.registerFrameHandler(scene.UPDATE_CONTROLLER_PRIORITY, updateGesture);
    }

    scene.Scene.initializers.push(initAccelerometer);
}
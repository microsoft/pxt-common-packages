enum ControllerGesture {
    /**
     * Shake gesture
     */
    //% block="shake"
    Shake = Gesture.Shake,
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
    let lastGesture: ControllerGesture = undefined;
    let gestureHandlers: any;

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
        if (!gestureHandlers) gestureHandlers = {};
        gestureHandlers[gesture] = handler;
        input.onGesture(<Gesture><number>gesture, () => {
            lastGesture = gesture;
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
        if (gestureHandlers && lastGesture !== undefined && gestureHandlers[lastGesture]) {
            const handler = gestureHandlers[lastGesture];
            lastGesture = undefined;
            handler();
        }
    }

    function initAccelerometer(s: scene.Scene) {
        s.eventContext.registerFrameHandler(scene.UPDATE_PRIORITY, updateGesture);
    }

    scene.Scene.initializers.push(initAccelerometer);
}
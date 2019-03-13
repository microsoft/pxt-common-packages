namespace controller {
    let vibrationPin: DigitalInOutPin;
    let vibrationTime: number;

    function updateVibration() {
        // turn off vibration if needed
        if (vibrationPin && vibrationTime > 0 && vibrationTime > control.millis()) {
            vibrationPin.digitalWrite(false);
            vibrationTime = -1;
        }
    }

    function initVibration(s: scene.Scene) {
        if (!vibrationPin)
            vibrationPin = pins.pinByCfg(DAL.CFG_PIN_VIBRATION);
        vibrationTime = -1;
        if (vibrationPin)
            s.eventContext.registerFrameHandler(scene.UPDATE_PRIORITY, updateVibration);
    }

    /**
     * Vibrates the controller for the given duration (in milli seconds)
     * @param millis 
     */
    //% blockId=ctrlvibrate block="vibrate $millis ms"
    //% millis.shadow=timePicker
    //% group="Extras"
    export function vibrate(millis: number) {
        if (millis <= 0) vibrationTime = -1;
        else vibrationTime = control.millis() + millis;
    }

    scene.Scene.initializers.push(initVibration);
}
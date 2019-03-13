namespace controller {
    let vibrationPin: DigitalInOutPin;
    let vibrationEnd: number;

    function updateVibration() {
        // turn off vibration if needed
        if (vibrationEnd > 0 && vibrationEnd < control.millis()) {
            console.log(`${vibrationEnd} > ${control.millis()}`)
            if (vibrationPin)
                vibrationPin.digitalWrite(false);
            vibrationEnd = -1;
            console.log('vibration off')
        }
    }

    function initVibration(s: scene.Scene) {
        if (!vibrationPin)
            vibrationPin = pins.pinByCfg(DAL.CFG_PIN_VIBRATION);
        vibrationEnd = -1;
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
        const off = vibrationEnd <= 0;
        vibrationEnd = millis <= 0 ? -1 : (control.millis() + Math.min(3000, millis));
        if (off) {
            if (vibrationPin)
                vibrationPin.digitalWrite(true);
            console.log('vibration on')
        }
    }

    scene.Scene.initializers.push(initVibration);
}
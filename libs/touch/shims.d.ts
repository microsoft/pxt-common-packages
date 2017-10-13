// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Capacitive pin A1
     */
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getTouchButton
    //% block="pin A1" fixedInstance shim=pxt::getTouchButton(0)
    const pinA1: TouchButton;

    /**
     * Capacitive pin A2
     */
    //% block="pin A2" fixedInstance shim=pxt::getTouchButton(1)
    const pinA2: TouchButton;

    /**
     * Capacitive pin A3
     */
    //% block="pin A3" fixedInstance shim=pxt::getTouchButton(2)
    const pinA3: TouchButton;

    /**
     * Capacitive pin A4
     */
    //% block="pin A4" fixedInstance shim=pxt::getTouchButton(3)
    const pinA4: TouchButton;

    /**
     * Capacitive pin A5
     */
    //% block="pin A5" fixedInstance shim=pxt::getTouchButton(4)
    const pinA5: TouchButton;

    /**
     * Capacitive pin A6
     */
    //% block="pin A6" fixedInstance shim=pxt::getTouchButton(5)
    const pinA6: TouchButton;

    /**
     * Capacitive pin A7
     */
    //% block="pin A7" fixedInstance shim=pxt::getTouchButton(6)
    const pinA7: TouchButton;
}


declare interface TouchButton {
    /**
     * Manually define the threshold use to detect a touch event. Any sensed value equal to or greater than this value will be interpreted as a touch.
     * @param name button name
     * @param threshold minimum value to consider a touch eg:200
     */
    //% blockId=touch_set_threshold block="button %button|set threshold %threshold"
    //% blockNamespace=input
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4
    //% group="More" weight=16 blockGap=8 shim=TouchButtonMethods::setThreshold
    setThreshold(threshold: int32): void;

    /**
     * Reads the current value registered with the button.
     * @param name button name
     */
    //% blockId=touch_value block="button %button|value"
    //% blockNamespace=input
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4
    //% group="More" weight=49 blockGap=8 shim=TouchButtonMethods::value
    value(): int32;
}

// Auto-generated. Do not edit. Really.

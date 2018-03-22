// Auto-generated. Do not edit.


declare interface DigitalPin {
    /**
     * Get the push button (connected to GND) for given pin
     */
    //% shim=DigitalPinMethods::pushButton
    pushButton(): Button;
}



    //% noRefCounting fixedInstances
declare interface Button {
    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed
    //% block="%button|is pressed"
    //% blockId=buttonIsPressed
    //% parts="buttons"
    //% blockNamespace=input
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.width=220
    //% button.fieldOptions.columns=3
    //% weight=50 blockGap=8
    //% trackArgs=0 shim=ButtonMethods::isPressed
    isPressed(): boolean;

    /**
     * See if the button was pressed again since the last time you checked.
     * @param button the button to query the request
     */
    //% help=input/button/was-pressed
    //% block="%button|was pressed"
    //% blockId=buttonWasPressed
    //% parts="buttons"
    //% blockNamespace=input
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.width=220
    //% button.fieldOptions.columns=3
    //% group="More" weight=46 blockGap=8
    //% trackArgs=0 shim=ButtonMethods::wasPressed
    wasPressed(): boolean;
}

// Auto-generated. Do not edit. Really.

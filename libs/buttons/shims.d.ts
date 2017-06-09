// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Left button.
     */
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getButton
    //% block="button A" weight=95 fixedInstance shim=pxt::getButton(0)
    const buttonA: Button;

    /**
     * Right button.
     */
    //% block="button B" weight=94 fixedInstance shim=pxt::getButton(1)
    const buttonB: Button;

    /**
     * Left and Right button.
     */
    //% block="buttons A+B" weight=93 fixedInstance shim=pxt::getButton(2)
    const buttonsAB: Button;
}



    //% noRefCounting fixedInstances
declare interface Button {
    /**
     * Do something when a button (`A`, `B` or both `A` + `B`) is clicked, double clicked, etc...
     * @param button the button that needs to be clicked or used
     * @param event the kind of button gesture that needs to be detected
     * @param body code to run when the event is raised
     */
    //% help=input/button/on-event weight=99 blockGap=8
    //% blockId=buttonEvent block="on %button|%event"
    //% parts="buttonpair"
    //% blockNamespace=input
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.width=220
    //% button.fieldOptions.columns=3 shim=ButtonMethods::onEvent
    onEvent(ev: ButtonEvent, body: () => void): void;

    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed weight=79
    //% block="%button|is pressed"
    //% blockId=buttonIsPressed
    //% blockGap=8
    //% parts="buttonpair"
    //% blockNamespace=input
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.width=220
    //% button.fieldOptions.columns=3 shim=ButtonMethods::isPressed
    isPressed(): boolean;

    /**
     * See if the button was pressed again since the last time you checked.
     * @param button the button to query the request
     */
    //% help=input/button/was-pressed weight=78
    //% block="%button|was pressed"
    //% blockId=buttonWasPressed
    //% parts="buttonpair" blockGap=8
    //% blockNamespace=input advanced=true
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.width=220
    //% button.fieldOptions.columns=3 shim=ButtonMethods::wasPressed
    wasPressed(): boolean;
}

// Auto-generated. Do not edit. Really.

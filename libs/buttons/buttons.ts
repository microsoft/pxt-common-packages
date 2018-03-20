namespace ButtonMethods {
    /**
     * Do something when a button (`A`, `B` or both `A` + `B`) is clicked, double clicked, etc...
     * @param button the button that needs to be clicked or used
     * @param event the kind of button gesture that needs to be detected
     * @param body code to run when the event is raised
     */
    //% help=input/button/on-event
    //% blockId=buttonEvent block="on %button|%event"
    //% parts="buttons"
    //% blockNamespace=input
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.width=220
    //% button.fieldOptions.columns=3
    //% weight=96 blockGap=12
    //% trackArgs=0
    export function onEvent(button: Button, ev: ButtonEvent, body: () => void) {
        control.onEvent(button.id(), ev, body);
    }
}
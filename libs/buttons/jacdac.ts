namespace jacdac {
    export class ButtonService extends SensorService {
        private button: Button;
        constructor(name: string, button: Button) {
            super(name, jacdac.BUTTON_DEVICE_CLASS);
            this.button = button;
            jacdac.BUTTON_EVENTS.forEach((ev, j) => {
                control.onEvent(this.button.id(), ev, () => {
                    this.raiseHostEvent(ev);
                })
            })
        }

        serializeState() {
            const buf = control.createBuffer(1);
            buf.setNumber(NumberFormat.UInt8LE, 0, this.button.isPressed() ? 0xff : 0);
            return buf;
        }
    }

    /**
     * Connects the events of the button to the controller button
     * @param controllerButton 
     * @param button 
     */
    //% blockId=jdattachctrlbtn block="jacdac attach $button to controller $controllerButton"
    //% group="Controller"
    export function attachButtonToController(button: Button, controllerButton: JDControllerButton) {
        button.onEvent(ButtonEvent.Up, () => jacdac.controllerClient.setIsPressed(controllerButton, false));
        button.onEvent(ButtonEvent.Down, () => jacdac.controllerClient.setIsPressed(controllerButton, true));
    }
}
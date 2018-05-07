enum ControllerButtonEvent {
    //% block="pressed"
    Pressed = KEY_DOWN,
    //% block="released"
    Released = KEY_UP
}

/**
 * Access to game controls
 */
//% weight=97 color="#FE8C4F" icon="\uf11b"
namespace controller {
    let _userEventsEnabled = true;

    //% fixedInstances
    export class Button {
        id: number;
        private _pressed: boolean;
        private checked: boolean;

        constructor(id: number, buttonId?: number, upid?: number, downid?: number) {
            this.id = id;
            this._pressed = false;
            this.checked = false;
            control.internalOnEvent(INTERNAL_KEY_UP, this.id, () => {
                if (this._pressed) {
                    this._pressed = false
                    if (_userEventsEnabled)
                        control.raiseEvent(KEY_UP, this.id)
                    else
                        control.raiseEvent(SYSTEM_KEY_UP, this.id)
                }
            }, 16)
            control.internalOnEvent(INTERNAL_KEY_DOWN, this.id, () => {
                if (!this._pressed) {
                    this._pressed = true
                    this.checked = false
                    if (_userEventsEnabled)
                        control.raiseEvent(KEY_DOWN, this.id)
                    else
                        control.raiseEvent(SYSTEM_KEY_DOWN, this.id)
                }
            }, 16)
            if (buttonId && upid && downid) {
                control.internalOnEvent(buttonId, upid, () => control.raiseEvent(INTERNAL_KEY_UP, this.id), 16)
                control.internalOnEvent(buttonId, downid, () => control.raiseEvent(INTERNAL_KEY_DOWN, this.id), 16)
            }
        }

        /**
         * Run some code when a button is pressed or released
         */
        //% weight=99 blockGap=8 help=controller/button/on-event
        //% blockId=keyonevent block="on %button **button** %event"
        onEvent(event: ControllerButtonEvent, handler: () => void) {
            control.onEvent(event, this.id, handler);
        }

        /**
         * Pauses until a button is pressed or released
         */
        //% weight=98 blockGap=8 help=controller/button/pause-until
        //% blockId=keypauseuntil block="pause until %button **button** is %event"
        pauseUntil(event: ControllerButtonEvent) {
            control.waitForEvent(event, this.id)
        }

        /**
         * Indicates if the button is currently pressed
        */
        //% weight=96 blockGap=8 help=controller/button/is-pressed
        //% blockId=keyispressed block="is %button **button** pressed"
        isPressed() {
            return this._pressed
        }

        /**
         * Indicates if the button was pressed since the last call
        */
        //% weight=95 help=controller/button/was-pressed
        //% blockId=keywaspressed block="was %button **button** pressed"
        wasPressed() {
            if (!this.checked) {
                this.checked = true
                return this._pressed
            }
            return false
        }
    }

    //% fixedInstance block="any"
    export const anyButton = new Button(0);

    /**
     * Get the horizontal movement, given the step and state of buttons
     * @param step the distance, eg: 100
     */
    //% weight=50 blockGap=8 help=controller/dx
    //% blockId=keysdx block="dx (left-right keys)||scaled by %step"
    //% step.defl=100
    export function dx(step: number = 100) {
        const ctx = control.eventContext();
        if (!ctx) return 0;

        if (controller.left.isPressed()) {
            if (controller.right.isPressed()) return 0
            else return -step * ctx.deltaTime;
        }
        else if (controller.right.isPressed()) return step * ctx.deltaTime
        else return 0
    }

    /**
     * Get the vertical movement, given the step and state of buttons
     * @param step the distance, eg: 100
     */
    //% weight=49 help=keys/dy
    //% blockId=keysdy block="dy (up-down keys)||scaled by %step"
    //% step.defl=100
    export function dy(step: number = 100) {
        const ctx = control.eventContext();
        if (!ctx) return 0;

        if (controller.up.isPressed()) {
            if (controller.down.isPressed()) return 0
            else return -step * ctx.deltaTime;
        }
        else if (controller.down.isPressed()) return step * ctx.deltaTime
        else return 0
    }

    /**
     * Pause the program until a button is pressed
     */
    //% weight=10
    //% blockId=keypauseuntilanykey block="pause until any button is pressed"
    export function pauseUntilAnyButtonIsPressed() {
        control.waitForEvent(KEY_DOWN, 0)
    }

    export function _setUserEventsEnabled(enabled: boolean) {
        _userEventsEnabled = enabled;
    }
}
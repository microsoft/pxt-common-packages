enum ControllerButtonEvent {
    //% block="pressed"
    Pressed = KEY_DOWN,
    //% block="released"
    Released = KEY_UP,
    //% block="repeat"
    Repeated = KEY_REPEAT
}

/**
 * Access to game controls
 */
//% weight=98 color="#e15f41" icon="\uf11b"
namespace controller {
    let _userEventsEnabled = true;
    let _activeButtons: Button[];

    //% fixedInstances
    export class Button {
        public id: number;
        public repeatDelay: number;
        public repeatInterval: number;
        private _pressed: boolean;
        private _pressedElasped: number;
        private _repeatCount: number;

        constructor(id: number, buttonId?: number, upid?: number, downid?: number) {
            this.id = id;
            this._pressed = false;
            this.repeatDelay = 500;
            this.repeatInterval = 30;
            this._repeatCount = 0;
            control.internalOnEvent(INTERNAL_KEY_UP, this.id, () => {
                if (this._pressed) {
                    this._pressed = false
                    this.raiseButtonUp();
                }
            }, 16)
            control.internalOnEvent(INTERNAL_KEY_DOWN, this.id, () => {
                if (!this._pressed) {
                    this._pressed = true;
                    this._pressedElasped = 0;
                    this._repeatCount = 0;
                    this.raiseButtonDown();
                }
            }, 16)
            if (buttonId && upid && downid) {
                control.internalOnEvent(buttonId, upid, () => control.raiseEvent(INTERNAL_KEY_UP, this.id), 16)
                control.internalOnEvent(buttonId, downid, () => control.raiseEvent(INTERNAL_KEY_DOWN, this.id), 16)
            }

            // register button in global list
            if (!_activeButtons) _activeButtons = [];
            _activeButtons.push(this);
        }

        private raiseButtonUp() {
            if (_userEventsEnabled)
                control.raiseEvent(KEY_UP, this.id)
            else
                control.raiseEvent(SYSTEM_KEY_UP, this.id);
        }

        private raiseButtonDown() {
            if (_userEventsEnabled)
                control.raiseEvent(KEY_DOWN, this.id)
            else
                control.raiseEvent(SYSTEM_KEY_DOWN, this.id)
        }

        private raiseButtonRepeat() {
            if (_userEventsEnabled)
                control.raiseEvent(KEY_REPEAT, this.id)
            else
                control.raiseEvent(SYSTEM_KEY_REPEAT, this.id)
        }

        /**
         * Run some code when a button is pressed, released, or held
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
            return this._pressed;
        }

        setPressed(pressed: boolean) {
            if (this._pressed != pressed) {
                this._pressed = pressed;
                if (this._pressed)
                    this.raiseButtonUp();
                else
                    this.raiseButtonDown();
            }
        }

        __update(dtms: number) {
            if (!this._pressed) return;
            this._pressedElasped += dtms;
            // inital delay
            if (this._pressedElasped < this.repeatDelay)
                return;

            // do we have enough time to repeat
            const count = Math.floor((this._pressedElasped - this.repeatDelay) / this.repeatInterval);
            if (count != this._repeatCount) {
                this.raiseButtonRepeat();
                this._repeatCount = count;
            }
        }
    }

    //% fixedInstance block="any"
    export const anyButton = new Button(0);

    /**
     * Get the horizontal movement, given the step and state of buttons
     * @param step the distance, eg: 100
     */
    //% weight=50 blockGap=8 help=controller/dx
    //% blockId=keysdx block="dx (left-right buttons)||scaled by %step"
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
    //% blockId=keysdy block="dy (up-down buttons)||scaled by %step"
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
    export function pauseUntilAnyButtonIsPressed() {
        control.waitForEvent(KEY_DOWN, 0)
    }

    export function _setUserEventsEnabled(enabled: boolean) {
        _userEventsEnabled = enabled;
    }

    /**
     * Called by the game engine to update and/or raise events
     */
    export function __update(dt: number) {
        if (!_activeButtons) return;
        const dtms = (dt * 1000) | 0
        _activeButtons.forEach(btn => btn.__update(dtms));
    }

    export function serializeState(): Buffer {
        const buf = control.createBuffer(1);
        let pressed = 0;
        for(let i = 0; i < _activeButtons.length; ++i)
            pressed = pressed | ((_activeButtons[i].isPressed() ? 1 : 0) << (_activeButtons[i].id - 1));
        buf[0] = pressed;
        return buf;
    }
}
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
//% groups='["Single Player", "Multi Player"]'
namespace controller {
    let _userEventsEnabled = true;

    //% fixedInstances
    export class Button {
        public id: number;
        public repeatDelay: number;
        public repeatInterval: number;
        private _pressed: boolean;
        private _pressedElasped: number;
        private _repeatCount: number;
        private _initEvents: () => void;

        constructor(id: number, buttonId?: number, upid?: number, downid?: number) {
            this.id = id;
            this._pressed = false;
            this.repeatDelay = 500;
            this.repeatInterval = 30;
            this._repeatCount = 0;
            this._initEvents = () => {
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
            }
        }

        initEvents() {
            if (this._initEvents) {
                this._initEvents();
                this._initEvents = undefined;
            }
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
        //% group="Single Player"
        onEvent(event: ControllerButtonEvent, handler: () => void) {
            this.initEvents();
            control.onEvent(event, this.id, handler);
        }

        /**
         * Pauses until a button is pressed or released
         */
        //% weight=98 blockGap=8 help=controller/button/pause-until
        // blockId=keypauseuntil block="pause until %button **button** is %event"
        //% group="Single Player"
        pauseUntil(event: ControllerButtonEvent) {
            this.initEvents();
            control.waitForEvent(event, this.id)
        }

        /**
         * Indicates if the button is currently pressed
        */
        //% weight=96 blockGap=8 help=controller/button/is-pressed
        //% blockId=keyispressed block="is %button **button** pressed"
        //% group="Single Player"
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
}
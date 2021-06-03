enum ControllerButtonEvent {
    //% block="pressed"
    Pressed = KEY_DOWN,
    //% block="released"
    Released = KEY_UP,
    //% block="repeat"
    Repeated = KEY_REPEAT
}

enum ControllerButton {
    //% block="{id:controller}A"
    A = 5,
    //% block="{id:controller}B"
    B = 6,
    //% block="left"
    Left = 1,
    //% block="up"
    Up = 2,
    //% block="right"
    Right = 3,
    //% block="down"
    Down = 4
}

/**
 * Access to game controls
 */
//% weight=98 color="#D54322" icon="\uf11b"
//% groups='["Single Player", "Multiplayer"]'
//% blockGap=8
namespace controller {
    let _userEventsEnabled = true;
    let defaultRepeatDelay = 500;
    let defaultRepeatInterval = 30;

    //% shim=pxt::pressureLevelByButtonId
    declare function pressureLevelByButtonId(btnId: number, codalId: number): number;

    //% shim=pxt::setupButton
    function setupButton(buttonId: number, key: number) {
        return // missing in sim
     }

    //% fixedInstances
    export class Button {
        _owner: Controller;
        public id: number;
        //% help=controller/button/repeat-delay
        public repeatDelay: number;
        //% help=controller/button/repeat-interval
        public repeatInterval: number;
        private _pressed: boolean;
        private _pressedElasped: number;
        private _repeatCount: number;

        toString(): string {
            return `btn ${this.id} ${this._pressed ? "down" : "up"}`;
        }

        constructor(id: number, configKey: number) {
            this.id = id;
            this._pressed = false;
            this.repeatDelay = undefined;
            this.repeatInterval = undefined;
            this._repeatCount = 0;
            if (id > 0) {
                // this is to deal with the "anyButton" hack, which creates a button that is not visible
                // in the UI, but used in event-handler to simulate the wildcard ANY for matching. As
                // this button can't actually be pressed, we don't want it to propagate events
                control.internalOnEvent(INTERNAL_KEY_UP, this.id, () => this.setPressed(false), 16)
                control.internalOnEvent(INTERNAL_KEY_DOWN, this.id, () => this.setPressed(true), 16)

                if (configKey > 0)
                    setupButton(id, configKey)
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
            control.onEvent(event, this.id, handler);
        }

        /**
         * Pauses until a button is pressed or released
         */
        //% weight=98 blockGap=8 help=controller/button/pause-until
        // blockId=keypauseuntil block="pause until %button **button** is %event"
        //% group="Single Player"
        pauseUntil(event: ControllerButtonEvent) {
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

        /**
         * Indicates how hard the button is pressed, 0-512
         */
        pressureLevel() {
            if (control.deviceDalVersion() == "sim") {
                return this.isPressed() ? 512 : 0
                // once implemented in sim, this could be similar to the one below
            } else {
                return pressureLevelByButtonId(this.id, -1);
            }
        }

        setPressed(pressed: boolean) {
            if (this._pressed != pressed) {
                power.poke();
                if (this._owner)
                    this._owner.connected = true;
                this._pressed = pressed;
                if (this._pressed) {
                    this._pressedElasped = 0;
                    this.raiseButtonDown();
                } else {
                    this._repeatCount = 0;
                    this.raiseButtonUp();
                }
            }
        }

        __update(dtms: number) {
            if (!this._pressed) return;
            this._pressedElasped += dtms;

            const delay = this.repeatDelay === undefined ? defaultRepeatDelay : this.repeatDelay;
            const interval = this.repeatInterval === undefined ? defaultRepeatInterval : this.repeatInterval;

            // inital delay
            if (this._pressedElasped < delay)
                return;

            // repeat count for this step
            const count = Math.floor((this._pressedElasped - delay - interval) / interval);
            if (count != this._repeatCount) {
                this.raiseButtonRepeat();
                this._repeatCount = count;
            }
        }
    }

    /**
     * Configures the timing of the on button repeat event for all of the controller buttons
     * @param delay number of milliseconds from when the button is pressed to when the repeat event starts firing, eg: 500
     * @param interval minimum number of milliseconds between calls to the button repeat event, eg: 30
     */
    export function setRepeatDefault(delay: number, interval: number) {
        defaultRepeatDelay = delay;
        defaultRepeatInterval = interval;
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

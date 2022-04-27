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

    export class ButtonHandler {
        constructor(public event: number, public callback: () => void) { }
    }

    export class ButtonEventHandlerState {
        constructor(public id: number) {};

        public user: ButtonHandler[];
        public system: ButtonHandler[];
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

        protected get handlerState(): ButtonEventHandlerState {
            for (const state of game.currentScene().buttonEventHandlers) {
                if (state.id === this.id) return state;
            }
            return undefined;
        }

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
            const eventHandler = this.getOrCreateHandlerForEvent(event);
            eventHandler.callback = handler;
        }

        /**
         * Adds an event handler that will fire whenever the specified event
         * is triggered on this button. Handlers added using this method will
         * not conflict with events added via onEvent. The same handler can
         * not be added for the same event more than once.
         *
         * @param event     The event to subscribe to for this button
         * @param handler   The code to run when the event triggers
         */
        addEventListener(event: ControllerButtonEvent, handler: () => void) {
            this.getOrCreateHandlerForEvent(event);

            const handlerState = this.handlerState;

            if (!handlerState.system) handlerState.system = [];

            for (const eventHandler of handlerState.system) {
                if (eventHandler.event === event && eventHandler.callback === handler) return;
            }

            handlerState.system.push(new ButtonHandler(event, handler));
        }

        /**
         * Removes an event handler registered with addEventListener.
         *
         * @param event     The event that the handler was registered for
         * @param handler   The handler to remove
         */
        removeEventListener(event: ControllerButtonEvent, handler: () => void) {
            const handlerState = this.handlerState;
            if (!handlerState || !handlerState.system) return;

            for (let i = 0; i < handlerState.system.length; i++) {
                if (handlerState.system[i].event === event && handlerState.system[i].callback === handler) {
                    handlerState.system.splice(i, 1)
                    return;
                }
            }
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

        protected runButtonEvents(event: ControllerButtonEvent) {
            const handlerState = this.handlerState;
            if (!handlerState) return;

            const userHandler = this.getOrCreateHandlerForEvent(event);
            if (userHandler.callback) userHandler.callback();

            if (handlerState.system) {
                for (const eventHandler of handlerState.system) {
                    if (eventHandler.event === event && eventHandler.callback) eventHandler.callback();
                }
            }
        }

        protected getOrCreateHandlerForEvent(event: ControllerButtonEvent) {
            if (!this.handlerState) {
                game.currentScene().buttonEventHandlers.push(new ButtonEventHandlerState(this.id));
            }

            const handlerState = this.handlerState;
            if (!handlerState.user) handlerState.user = [];

            for (const eventHandler of handlerState.user) {
                if (eventHandler.event === event) {
                    return eventHandler;
                }
            }

            // Register actual handler if this hasn't been used before
            control.onEvent(event, this.id, () => this.runButtonEvents(event));

            const newHandler = new ButtonHandler(event, undefined);
            handlerState.user.push(newHandler);
            return newHandler;
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

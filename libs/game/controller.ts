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

enum ControllerEvent {
    //% block="connected"
    Connected = 1,
    //% block="disconnected"
    Disconnected = 2
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

    class AnyButton extends Button {
        isPressed(): boolean {
            const ctrl = _player1();

            for (const b of ctrl.buttons) {
                if (b.isPressed()) return true;
            }
            return false;
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

    let _players: Controller[];

    function addController(ctrl: Controller) {
        if (!_players) {
            _players = [];
        }
        _players[ctrl.playerIndex - 1] = ctrl;
    }

    export function _player1(): Controller {
        if (!_players || !_players[0])
            new Controller(1, [controller.left, controller.up, controller.right, controller.down, controller.A, controller.B, controller.menu]);
        return _players[0];
    }

    export function players(): Controller[] {
        _player1(); // ensure player1 is present
        return _players.filter(ctrl => !!ctrl);
    }

    export class ControlledSprite {
        public _inputLastFrame: boolean;
        constructor(
            public s: Sprite,
            public vx: number,
            public vy: number
        ) { }
    }

    export function _moveSprites() {
        // todo: move to currecnt sceane
        control.enablePerfCounter("controller")
        players().forEach(ctrl => ctrl.__preUpdate());
    }

    //% fixedInstances
    export class Controller {
        playerIndex: number;
        buttons: Button[];
        analog: boolean;
        private _id: number;
        private _connected: boolean;

        // array of left,up,right,down,a,b,menu buttons
        constructor(playerIndex: number, buttons: Button[]) {
            this._id = control.allocateNotifyEvent();
            this._connected = false;
            this.playerIndex = playerIndex;
            this.analog = false;
            if (buttons)
                this.buttons = buttons;
            else {
                this.buttons = [];
                const leftId = 1 + (this.playerIndex - 1) * 7;
                for (let i = 0; i < 7; ++i) {
                    this.buttons.push(new Button(leftId + i, -1));
                }
            }
            for (let i = 0; i < this.buttons.length; ++i)
                this.buttons[i]._owner = this;
            addController(this);
        }

        get _controlledSprites(): ControlledSprite[] {
            return game.currentScene().controlledSprites[this.playerIndex];
        }

        set _controlledSprites(cps: ControlledSprite[]) {
            game.currentScene().controlledSprites[this.playerIndex] = cps;
        }

        get id() {
            return this._id;
        }

        dump() {
            this.buttons.forEach(b => console.log(b.toString()));
        }

        /**
         * Get the 'Left' button
         */
        //%
        get left() {
            return this.button(ControllerButton.Left);
        }

        /**
         * Get the 'Right' button
         */
        //%
        get right() {
            return this.button(ControllerButton.Right);
        }

        /**
         * Get the 'Up' button
         */
        //%
        get up() {
            return this.button(ControllerButton.Up);
        }

        /**
         * Get the 'Down' button
         */
        //%
        get down() {
            return this.button(ControllerButton.Down);
        }

        /**
         * Get the 'A' button
         */
        //%
        get A() {
            return this.button(ControllerButton.A);
        }

        /**
         * Get the 'B' button
         */
        //%
        get B() {
            return this.button(ControllerButton.B);
        }

        /**
         * Get the 'Menu' button
         */
        //%
        get menu() {
            return this.button(7);
        }

        /**
         * Control a sprite using the direction buttons from the controller. Note that this will overwrite
         * the current velocity of the sprite whenever a directional button is pressed. To stop controlling
         * a sprite, pass 0 for vx and vy.
         *
         * @param sprite The Sprite to control
         * @param vx The velocity used for horizontal movement when left/right is pressed
         * @param vy The velocity used for vertical movement when up/down is pressed
         */
        //% blockId="ctrlgame_control_sprite" block="%controller move $sprite=variables_get(mySprite) with buttons||vx $vx vy $vy"
        //% weight=100
        //% expandableArgumentMode="toggle"
        //% vx.defl=100 vy.defl=100
        //% help=controller/move-sprite
        //% group="Multiplayer"
        moveSprite(sprite: Sprite, vx: number = 100, vy: number = 100) {
            if (!sprite) return;
            if (!this._controlledSprites) this._controlledSprites = [];
            let cp = this._controlledSprites.find(cp => cp.s.id == sprite.id);
            if (!cp) {
                cp = new ControlledSprite(sprite, vx, vy);
                this._controlledSprites.push(cp);
            }
            if (cp.vx && vx == 0) {
                cp.s.vx = 0
            }
            if (cp.vy && vy == 0) {
                cp.s.vy = 0
            }
            cp.vx = vx;
            cp.vy = vy;
        }

        private button(button: ControllerButton): Button {
            return this.buttons[button - 1];
        }

        /**
         * Run some code when a button is pressed, released, or held
         */
        //% weight=99 blockGap=8
        //% blockId=ctrlonbuttonevent block="on %controller %button **button** %event"
        //% group="Multiplayer"
        //% help=controller/on-button-event
        onButtonEvent(btn: ControllerButton, event: ControllerButtonEvent, handler: () => void) {
            this.button(btn).onEvent(event, handler);
        }

        /**
         * Register code run when a controller event occurs
         * @param event
         * @param handler
         */
        //% weight=99 blockGap=8
        //% blockId=ctrlonevent block="on %controller %event"
        //% group="Multiplayer"
        //% help=controller/on-event
        onEvent(event: ControllerEvent, handler: () => void) {
            control.onEvent(this.id, event, handler);
        }

        get connected() {
            return this._connected;
        }

        set connected(value: boolean) {
            if (value != this._connected) {
                this._connected = value;
                control.raiseEvent(this.id, this._connected ? ControllerEvent.Connected : ControllerEvent.Disconnected);
            }
        }

        /**
         * Indicates if the button is currently pressed
        */
        //% weight=96 blockGap=8 help=controller/button/is-pressed
        //% blockId=ctrlispressed block="is %controller %button **button** pressed"
        //% group="Multiplayer"
        isPressed(btn: ControllerButton): boolean {
            return this.button(btn).isPressed();
        }

        /**
         * Get the horizontal movement, given the step and state of buttons
         * @param step the distance, eg: 100
         */
        //% weight=50 blockGap=8 help=controller/dx
        //% blockId=ctrldx block="%controller dx (left-right buttons)||scaled by %step"
        //% step.defl=100
        //% group="Multiplayer"
        dx(step: number = 100) {
            const ctx = control.eventContext();
            if (!ctx) return 0;

            if (this.analog)
                return (this.right.pressureLevel() - this.left.pressureLevel()) / 512 * ctx.deltaTime * step
            if (this.left.isPressed()) {
                if (this.right.isPressed()) return 0
                else return -step * ctx.deltaTime;
            }
            else if (this.right.isPressed()) return step * ctx.deltaTime
            else return 0
        }

        /**
         * Get the vertical movement, given the step and state of buttons
         * @param step the distance, eg: 100
         */
        //% weight=49 help=keys/dy
        //% blockId=ctrldy block="%controller dy (up-down buttons)||scaled by %step"
        //% step.defl=100
        //% group="Multiplayer"
        dy(step: number = 100) {
            const ctx = control.eventContext();
            if (!ctx) return 0;

            if (this.analog)
                return (this.down.pressureLevel() - this.up.pressureLevel()) / 512 * ctx.deltaTime * step
            if (this.up.isPressed()) {
                if (this.down.isPressed()) return 0
                else return -step * ctx.deltaTime;
            }
            else if (this.down.isPressed()) return step * ctx.deltaTime
            else return 0
        }

        __preUpdate() {
            if (!this._controlledSprites) return;

            let deadSprites = false;

            let svx = 0
            let svy = 0

            if (this.analog) {
                svx = (this.right.pressureLevel() - this.left.pressureLevel()) >> 1
                svy = (this.down.pressureLevel() - this.up.pressureLevel()) >> 1
            } else {
                svx = (this.right.isPressed() ? 256 : 0) - (this.left.isPressed() ? 256 : 0)
                svy = (this.down.isPressed() ? 256 : 0) - (this.up.isPressed() ? 256 : 0)
            }

            let svxInCricle = svx
            let svyInCircle = svy

            // here svx/y are -256 to 256 range
            const sq = svx * svx + svy * svy
            // we want to limit svx/y to be within circle of 256 radius
            const max = 256 * 256
            // is it outside the circle?
            if (sq > max) {
                // if so, store the vector scaled down to fit in the circle
                const scale = Math.sqrt(max / sq)
                svxInCricle = scale * svx | 0
                svyInCircle = scale * svy | 0
            }

            this._controlledSprites.forEach(controlledSprite => {
                const { s, vx, vy } = controlledSprite;
                if (s.flags & sprites.Flag.Destroyed) {
                    deadSprites = true;
                    return;
                }

                if (controlledSprite._inputLastFrame) {
                    if (vx) s._vx = Fx.zeroFx8;
                    if (vy) s._vy = Fx.zeroFx8;
                }

                if (svx || svy) {
                    if (vx && vy) {
                        // if moving in both vx/vy use speed vector constrained to be within circle
                        s._vx = Fx.imul(svxInCricle as any as Fx8, vx)
                        s._vy = Fx.imul(svyInCircle as any as Fx8, vy)
                    } else if (vx) {
                        // otherwise don't bother
                        s._vx = Fx.imul(svx as any as Fx8, vx)
                    } else if (vy) {
                        s._vy = Fx.imul(svy as any as Fx8, vy)
                    }
                    controlledSprite._inputLastFrame = true;
                }
                else {
                    controlledSprite._inputLastFrame = false;
                }
            });

            if (deadSprites)
                this._controlledSprites = this._controlledSprites
                    .filter(s => !(s.s.flags & sprites.Flag.Destroyed));
        }

        __update(dtms: number) {
            dtms = dtms | 0;
            this.buttons.forEach(btn => btn.__update(dtms));
        }

        serialize(offset: number): Buffer {
            const buf = control.createBuffer(offset + 1);
            let b = 0;
            for (let i = 0; this.buttons.length; ++i)
                b |= (this.buttons[i].isPressed() ? 1 : 0) << i;
            buf[offset] = b
            return buf;
        }
    }

    /**
     * Called by the game engine to update and/or raise events
     */
    export function __update(dt: number) {
        const dtms = (dt * 1000) | 0
        players().forEach(ctrl => ctrl.__update(dtms));
    }

    export function serialize(offset: number): Buffer {
        return _player1().serialize(offset);
    }

    /**
     * Control a sprite using the direction buttons from the controller. Note that this
     * control will take over the vx and vy of the sprite and overwrite any changes
     * made unless a 0 is passed.
     *
     * @param sprite The Sprite to control
     * @param vx The velocity used for horizontal movement when left/right is pressed
     * @param vy The velocity used for vertical movement when up/down is pressed
     */
    //% blockId="game_control_sprite" block="move $sprite=variables_get(mySprite) with buttons||vx $vx vy $vy"
    //% weight=100
    //% expandableArgumentMode="toggle"
    //% vx.defl=100 vy.defl=100
    //% help=controller/move-sprite
    //% group="Single Player"
    export function moveSprite(sprite: Sprite, vx: number = 100, vy: number = 100) {
        _player1().moveSprite(sprite, vx, vy);
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
     * Get the horizontal movement, given the step and state of buttons
     * @param step the distance, eg: 100
     */
    //% weight=50 blockGap=8 help=controller/dx
    //% blockId=keydx block="dx (left-right buttons)||scaled by %step"
    //% step.defl=100
    //% group="Single Player"
    export function dx(step: number = 100) {
        return _player1().dx(step);
    }

    /**
     * Get the vertical movement, given the step and state of buttons
     * @param step the distance, eg: 100
     */
    //% weight=49 help=keys/dy
    //% blockId=keydy block="dy (up-down buttons)||scaled by %step"
    //% step.defl=100
    //% group="Single Player"
    export function dy(step: number = 100) {
        return _player1().dy(step);
    }


    //% fixedInstance block="any"
    export const anyButton: Button = new AnyButton(0, -1);
}

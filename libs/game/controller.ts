enum ControllerButtonEvent {
    //% block="pressed"
    Pressed = KEY_DOWN,
    //% block="released"
    Released = KEY_UP,
    //% block="repeat"
    Repeated = KEY_REPEAT
}


enum ControllerButton {
    //% block="A"
    A = 4,
    //% block="B"
    B = 5,
    //% block="left"
    Left = 0,
    //% block="up"
    Up = 1,
    //% block="right"
    Right = 2,
    //% block="down"
    Down = 3
}

/**
 * Access to game controls
 */
//% weight=98 color="#e15f41" icon="\uf11b"
//% groups='["Single Player", "Multi Player"]'
//% blockGap=8
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
        private _buttonId: number;

        toString(): string {
            return `btn ${this.id} ${this._buttonId} ${this._pressed ? "down" : "up"}`;
        }

        constructor(id: number, buttonId: number) {
            this.id = id;
            this._buttonId = buttonId;
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
            if (buttonId > -1) {
                control.internalOnEvent(buttonId, DAL.DEVICE_BUTTON_EVT_UP, () => control.raiseEvent(INTERNAL_KEY_UP, this.id), 16)
                control.internalOnEvent(buttonId, DAL.DEVICE_BUTTON_EVT_DOWN, () => control.raiseEvent(INTERNAL_KEY_DOWN, this.id), 16)
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

    /**
     * Get the horizontal movement, given the step and state of buttons
     * @param step the distance, eg: 100
     */
    //% weight=50 blockGap=8 help=controller/dx
    //% blockId=keydx block="dx (left-right buttons)||scaled by %step"
    //% step.defl=100
    //% group="Single Player"
    export function dx(step: number = 100) {
        return controller.controller1.dx(step);
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
        return controller.controller1.dy(step);
    }
}


namespace controller {
    let _controllers: Controller[];

    interface ControlledSprite {
        s: Sprite;
        vx: number;
        vy: number;
    }

    function addController(ctrl: Controller) {
        if (!_controllers) {
            _controllers = [];
            game.currentScene().eventContext.registerFrameHandler(19, moveSprites);
        }
        _controllers.push(ctrl);
    }

    function moveSprites() {
        // todo: move to currecnt sceane
        control.enablePerfCounter("controller")
        if (_controllers)
            _controllers.forEach(ctrl => ctrl.__preUpdate());
    }

    //% fixedInstances
    export class Controller {
        private buttons: Button[];
        private _controlledSprites: ControlledSprite[];

        // array of left,up,right,down,a,b,menu buttons
        constructor(leftId: number) {
            this.buttons = [];
            [
                DAL.CFG_PIN_BTN_LEFT,
                DAL.CFG_PIN_BTN_UP,
                DAL.CFG_PIN_BTN_RIGHT,
                DAL.CFG_PIN_BTN_DOWN,
                DAL.CFG_PIN_BTN_A,
                DAL.CFG_PIN_BTN_B,
                DAL.CFG_PIN_BTN_MENU
            ].forEach((cfg, i) => {
                const btn = pxt.getButtonByPinCfg(cfg);
                this.buttons.push(new Button(leftId + i, btn ? btn.id : -1));
            });
            addController(this);
        }

        dump() {
            this.buttons.forEach(b => console.log(b.toString()));
        }

        /**
         * Gets the left button
         */
        //%
        get left() {
            return this.button(ControllerButton.Left);
        }

        /**
         * Gets the right button
         */
        //%
        get right() {
            return this.button(ControllerButton.Right);
        }

        /**
         * Gets the right button
         */
        //%
        get up() {
            return this.button(ControllerButton.Up);
        }

        /**
         * Gets the right button
         */
        //%
        get down() {
            return this.button(ControllerButton.Down);
        }

        /**
         * Gets the right button
         */
        //%
        get A() {
            return this.button(ControllerButton.A);
        }

        /**
         * Gets the right button
         */
        //%
        get B() {
            return this.button(ControllerButton.B);
        }

        /**
         * Gets the right button
         */
        //%
        get menu() {
            return this.button(6);
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
        //% blockId="ctrlgame_control_sprite" block="%controller move $sprite=variables_get(mySprite) with buttons||vx $vx vy $vy"
        //% weight=100
        //% vx.defl=100 vy.defl=100
        //% help=controller/move-sprite
        //% group="Multi Player"
        moveSprite(sprite: Sprite, vx: number = 100, vy: number = 100) {
            if (!sprite) return;
            if (!this._controlledSprites) this._controlledSprites = [];
            let cp = this._controlledSprites.find(cp => cp.s.id == sprite.id);
            if (!cp)
                this._controlledSprites.push(cp = { s: sprite, vx: vx, vy: vy });
            cp.vx = vx;
            cp.vy = vy;
        }

        private button(button: ControllerButton): Button {
            return this.buttons[button];
        }

        /**
         * Run some code when a button is pressed, released, or held
         */
        //% weight=99 blockGap=8 help=controller/button/on-event
        //% blockId=ctrlonevent block="on %controller %button **button** %event"
        //% group="Multi Player"
        onEvent(btn: ControllerButton, event: ControllerButtonEvent, handler: () => void) {
            this.button(btn).onEvent(event, handler);
        }

        /**
         * Indicates if the button is currently pressed
        */
        //% weight=96 blockGap=8 help=controller/button/is-pressed
        //% blockId=ctrlispressed block="is %controller %button **button** pressed"
        //% group="Multi Player"
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
        //% group="Multi Player"
        dx(step: number = 100) {
            const ctx = control.eventContext();
            if (!ctx) return 0;

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
        //% group="Multi Player"
        dy(step: number = 100) {
            const ctx = control.eventContext();
            if (!ctx) return 0;

            if (this.up.isPressed()) {
                if (this.down.isPressed()) return 0
                else return -step * ctx.deltaTime;
            }
            else if (this.down.isPressed()) return step * ctx.deltaTime
            else return 0
        }

        __preUpdate() {
            if (!this._controlledSprites) return;

            this._controlledSprites.forEach(sprite => {
                if (sprite.vx) {
                    sprite.s.vx = 0;

                    if (this.right.isPressed()) {
                        sprite.s.vx = sprite.vx;
                    }
                    if (this.left.isPressed()) {
                        sprite.s.vx = -sprite.vx;
                    }
                }

                if (sprite.vy) {
                    sprite.s.vy = 0;

                    if (this.down.isPressed()) {
                        sprite.s.vy = sprite.vy;
                    }
                    if (this.up.isPressed()) {
                        sprite.s.vy = -sprite.vy;
                    }
                }
            });
        }

        __update(dt: number) {
            const dtms = (dt * 1000) | 0
            this.buttons.forEach(btn => btn.__update(dtms));
        }
    }

    /**
     * Called by the game engine to update and/or raise events
     */
    export function __update(dt: number) {
        const dtms = (dt * 1000) | 0
        _controllers.forEach(ctrl => ctrl.__update(dtms));
    }

    export function serialize(offset: number): Buffer {
        const buf = control.createBuffer(offset + 1);
        return buf;
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
    //% vx.defl=100 vy.defl=100
    //% help=controller/move-sprite
    //% group="Single Player"
    export function moveSprite(sprite: Sprite, vx: number = 100, vy: number = 100) {
        controller.controller1.moveSprite(sprite, vy, vy);
    }
}

namespace controller {
    //% fixedInstance whenUsed block="player 2"
    export const controller2 = new Controller(8);
    //% fixedInstance whenUsed block="player 3"
    export const controller3 = new Controller(16);
    //% fixedInstance whenUsed block="player 4"
    export const controller4 = new Controller(24);
    //% fixedInstance whenUsed block="player 1"
    export const controller1 = new Controller(1);

    //% fixedInstance whenUsed block="A"
    export const A = controller.controller1.A;
    //% fixedInstance whenUsed block="B"
    export const B = controller.controller1.B;
    //% fixedInstance whenUsed block="left"
    export const left = controller.controller1.left;
    //% fixedInstance whenUsed block="up"
    export const up = controller.controller1.up;
    //% fixedInstance whenUsed block="right"
    export const right = controller.controller1.right;
    //% fixedInstance whenUsed block="down"
    export const down = controller.controller1.down;
    //% fixedInstance whenUsed block="menu"
    export const menu = controller.controller1.menu;
}
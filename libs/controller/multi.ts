enum ControllerButton {
    //% block="left"
    Left = 0,
    //% block="up"
    Up,
    //% block="right"
    Right,
    //% block="down"
    Down,
    //% block="A"
    A,
    //% block="B"
    B,
    //% block="menu"
    Menu
}

namespace controller {
    let controllers: Controller[] = [];

    //% fixedInstances
    export class Controller {
        private buttons: Button[];
        // array of left,up,right,down,a,b,menu buttons
        constructor(leftId: number) {
            this.buttons = [];
            for (let i = 0; i < 7; ++i)
                this.buttons.push(new Button(leftId + i));

            controllers.push(this);
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
            return this.button(ControllerButton.Menu);
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
        controllers.forEach(ctrl => ctrl.__update(dtms));
    }

    export function serialize(offset: number): Buffer {
        const buf = control.createBuffer(offset + 1);
        return buf;
    }

    export function onEvent()
}
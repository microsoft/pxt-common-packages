
//% icon="\uf245"
//% color="#9c1355"
//% block="Browser Events"
namespace browserEvents {
    export enum Event {
        PointerDown = 6857,
        PointerUp = 6858,
        PointerMove = 6859,
        PointerLeave = 6860,
        PointerEnter = 6861,
        PointerCancel = 6862,
        PointerOver = 6863,
        PointerOut = 6864,
        Wheel = 6865,
        KeyDown = 6866,
        KeyUp = 6867
    }

    export enum MouseButtonId {
        Left = 1,
        Right = 2,
        Wheel = 3,
        Back = 4,
        Forward = 5
    }

    export enum MouseButtonEvent {
        Pressed = Event.PointerDown,
        Released = Event.PointerUp,
    }

    //% fixedInstances
    export class MouseButton {
        protected _pressed: boolean;
        protected pressHandler: (x: number, y: number) => void;
        protected pressListeners: ((x: number, y: number) => void)[];
        protected releaseHandler: (x: number, y: number) => void;
        protected releaseListeners: ((x: number, y: number) => void)[];

        constructor(public id: number) {
            control.internalOnEvent(Event.PointerDown, this.id, () => this.setPressed(false), 16);
            control.internalOnEvent(Event.PointerUp, this.id, () => this.setPressed(true), 16);

            this._pressed = false;
            this.pressListeners = [];
            this.releaseListeners = [];
        }

        setPressed(pressed: boolean) {
            this._pressed = pressed;
            if (pressed) {
                if (this.pressHandler) {
                    this.pressHandler(mouseX(), mouseY());
                }
                for (const handler of this.pressListeners) {
                    handler(mouseX(), mouseY());
                }
            }
            else {
                if (this.releaseHandler) {
                    this.releaseHandler(mouseX(), mouseY());
                }
                for (const handler of this.releaseListeners) {
                    handler(mouseX(), mouseY());
                }
            }
        }

        //% blockId=browserEvents_mouseButton_onEvent
        //% block="on $this mouse button $event $x $y"
        //% draggableParameters="reporter"
        //% group="Mouse"
        //% weight=50
        onEvent(event: MouseButtonEvent, handler: (x: number, y: number) => void) {
            if (event === MouseButtonEvent.Pressed) {
                this.pressHandler = handler;
            }
            else {
                this.releaseHandler = handler;
            }
        }

        //% blockId=browserEvents_mouseButton_isPressed
        //% block="is $this mouse button pressed"
        //% group="Mouse"
        //% weight=40
        isPressed() {
            return this._pressed;
        }

        //% blockId=browserEvents_mouseButton_pauseUntil
        //% block="pause until $this mouse button is $event"
        //% group="Mouse"
        //% weight=30
        pauseUntil(event: KeyEvent) {
            control.waitForEvent(event, this.id)
        }

        addEventListener(event: KeyEvent, handler: (x: number, y: number) => void) {
            if (event === KeyEvent.Pressed) {
                this.pressListeners.push(handler);
            }
            else {
                this.releaseListeners.push(handler);
            }
        }

        removeEventListener(event: KeyEvent, handler: (x: number, y: number) => void) {
            if (event === KeyEvent.Pressed) {
                this.pressListeners = this.pressListeners.filter(p => p !== handler);
            }
            else {
                this.releaseListeners = this.releaseListeners.filter(p => p !== handler);
            }
        }
    }

    //% blockId=browserEvents_onEvent
    //% block="on browser event $event"
    //% draggableParameters="reporter"
    //% group="Mouse"
    //% weight=10
    export function onEvent(event: Event, handler: () => void) {
        control.onEvent(event, 0, handler);
    }

    //% blockId=browserEvents_onMouseMove
    //% block="on mouse move $x $y"
    //% draggableParameters="reporter"
    //% group="Mouse"
    //% weight=100
    export function onMouseMove(handler: (x: number, y: number) => void) {
        control.onEvent(Event.PointerMove, 0, () => {
            handler(mouseX(), mouseY());
        });
    }

    //% blockId=browserEvents_onWheel
    //% block="on mouse wheel $dx $dy $dz"
    //% draggableParameters="reporter"
    //% group="Mouse"
    //% weight=20
    export function onWheel(handler: (dx: number, dy: number, dz: number) => void) {
        control.onEvent(Event.Wheel, 0, () => {
            handler(wheelDx(), wheelDy(), wheelDz());
        });
    }

    //% fixedInstance whenUsed block="left"
    export const MouseLeft = new MouseButton(MouseButtonId.Left);

    //% fixedInstance whenUsed block="right"
    export const MouseRight = new MouseButton(MouseButtonId.Right);

    //% fixedInstance whenUsed block="wheel"
    export const MouseWheel = new MouseButton(MouseButtonId.Wheel);

    //% fixedInstance whenUsed block="back"
    export const MouseBack = new MouseButton(MouseButtonId.Back);

    //% fixedInstance whenUsed block="forward"
    export const MouseForward = new MouseButton(MouseButtonId.Forward);

    //% fixedInstance whenUsed block="any"
    export const MouseAny = new MouseButton(0);
}
/// <reference path="../../core/dal.d.ts"/>

namespace pxsim {
    const DOUBLE_CLICK_TIME = 500;
    export class CommonButton extends Button {
        private _pressedTime: number = -1;
        private _clickedTime: number = -1;
        private _wasPressed: boolean;

        setPressed(p: boolean) {
            if (this.pressed === p) {
                return;
            }
            this.pressed = p;

            if (p) {
                this._wasPressed = true;
                board().bus.queue(this.id, DAL.DEVICE_BUTTON_EVT_DOWN);
                this._pressedTime = runtime.runningTime();
            }
            else if (this._pressedTime !== -1) {
                board().bus.queue(this.id, DAL.DEVICE_BUTTON_EVT_UP);
                const current = runtime.runningTime();

                if (current - this._pressedTime >= DAL.DEVICE_BUTTON_LONG_CLICK_TIME) {
                    board().bus.queue(this.id, DAL.DEVICE_BUTTON_EVT_LONG_CLICK);
                }
                else {
                    board().bus.queue(this.id, DAL.DEVICE_BUTTON_EVT_CLICK);
                }


                if (this._clickedTime !== -1) {
                    if (current - this._clickedTime <= DOUBLE_CLICK_TIME) {
                        board().bus.queue(this.id, DAL.DEVICE_BUTTON_EVT_DOUBLE_CLICK);
                    }
                }

                this._clickedTime = current;
            }

        }

        public wasPressed() {
            const temp = this._wasPressed;
            this._wasPressed = false;
            return temp;
        }

        public isPressed() {
            return this.pressed;
        }
    }

    export class CommonButtonState {
        usesButtonAB: boolean = false;
        buttons: CommonButton[];

        constructor() {
            this.buttons = [
                new CommonButton(DAL.DEVICE_ID_BUTTON_A),
                new CommonButton(DAL.DEVICE_ID_BUTTON_B),
                new CommonButton(DAL.DEVICE_ID_BUTTON_AB)
            ];
        }
    }
}
namespace pxsim.pxtcore {
    export function getButton(buttonId: number): Button {
        const buttons = board().buttonState.buttons;
        if (buttonId === 2) {
            board().buttonState.usesButtonAB = true;
            runtime.queueDisplayUpdate();
        }
        if (buttonId < buttons.length && buttonId >= 0) {
            return buttons[buttonId];
        }
        // panic
        return undefined;
    }
}

namespace pxsim.ButtonMethods {
    export function onEvent(button: pxsim.Button, ev: number, body: pxsim.RefAction): void {
        pxsim.pxtcore.registerWithDal(button.id, ev, body);
    }

    export function isPressed(button: pxsim.Button): boolean {
        return button.pressed;
    }

    export function wasPressed(button: pxsim.Button): boolean {
        return (<CommonButton>button).wasPressed();
    }
}

namespace pxsim {
    export class SlideSwitchState {
        public static id = 3000 /*DEVICE_ID_BUTTON_SLIDE*/;
        private left: boolean = false;

        setState(left: boolean) {
            if (this.left === left) {
                return;
            }
            else if (left) {
                board().bus.queue(SlideSwitchState.id, DAL.DEVICE_BUTTON_EVT_UP);
            }
            else {
                board().bus.queue(SlideSwitchState.id, DAL.DEVICE_BUTTON_EVT_DOWN);
            }
            this.left = left;
        }

        isLeft(): boolean {
            return this.left;
        }
    }
}

namespace pxsim.input {
    export function onSwitchMoved(direction: number, body: RefAction) {
        pxtcore.registerWithDal(SlideSwitchState.id, direction, body);
    }

    export function switchRight() : boolean {
        const b = board() as SlideSwitchBoard;
        const sw = b.slideSwitchState;
        return !sw.isLeft();
    }
}
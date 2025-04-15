namespace pxsim.browserEvents {
    export interface BrowserEventsBoard extends CommonBoard {
        mouseState: MouseState;
    }

    const THROTTLE_INTERVAL = 50;

    export const INTERNAL_KEY_DOWN = 6870;
    export const INTERNAL_KEY_UP = 6871;
    export const INTERNAL_POINTER_DOWN = 6868;
    export const INTERNAL_POINTER_UP = 6869;

    export type MouseEvent = "pointerdown" | "pointerup" | "pointermove" | "pointerleave" | "pointerenter" | "pointercancel" | "pointerover" | "pointerout";
    export class MouseState {
        protected x: number;
        protected y: number;

        protected dx: number;
        protected dy: number;
        protected dz: number;

        protected onMove = pxsim.U.throttle(() => {
            board().bus.queue(
                6859,
                0
            );
        }, THROTTLE_INTERVAL, true);

        protected onWheel = pxsim.U.throttle(() => {
            board().bus.queue(
                6865,
                0
            );
        }, THROTTLE_INTERVAL, true);

        onEvent(event: PointerEvent, x: number, y: number) {
            this.x = x;
            this.y = y;

            const events = [
                "pointerdown",
                "pointerup",
                "pointermove",
                "pointerleave",
                "pointerenter",
                "pointercancel",
                "pointerover",
                "pointerout",
            ];

            let eventId = 6857 + events.indexOf(event.type);

            if (event.type === "pointerdown") {
                eventId = INTERNAL_POINTER_DOWN;
            }
            else if (event.type === "pointerup") {
                eventId = INTERNAL_POINTER_UP;
            }

            // We add 1 to the button here because the left button is 0 and
            // that's used as a wildcard in our event bus
            board().bus.queue(
                eventId,
                (event.button || 0) + 1
            );
        }

        onWheelEvent(dx: number, dy: number, dz: number) {
            this.dx = dx;
            this.dy = dy;
            this.dz = dz;
            this.onWheel();
        }

        mouseX() {
            return this.x || 0;
        }

        mouseY() {
            return this.y || 0;
        }

        wheelDx() {
            return this.dx || 0;
        }

        wheelDy() {
            return this.dy || 0;
        }

        wheelDz() {
            return this.dz || 0;
        }
    }
}
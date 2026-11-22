namespace pxsim.browserEvents {
    /** Queues the key down or key up events for a DOM keyboard event. */
    export function onKeyboardEvent(event: KeyboardEvent, pressed: boolean) {
        onKeyboardInput(event.key, event.location, pressed);
    }

    /** Records the pointer position in `state` and queues the event for a DOM pointer event. */
    export function onPointerEvent(state: MouseState, event: PointerEvent, x: number, y: number) {
        state.onEvent(event.type as MouseEvent, event.button, x, y);
    }
}

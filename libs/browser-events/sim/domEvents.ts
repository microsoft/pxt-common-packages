namespace pxsim.browserEvents {
    /**
     * Queues the bus events for a DOM keyboard event.
     * @param event the DOM keyboard event
     * @param pressed true for a key press, false for a release
     */
    export function onKeyboardEvent(event: KeyboardEvent, pressed: boolean) {
        onKeyboardInput(event.key, event.location, pressed);
    }

    /**
     * Records the pointer position in a mouse state and queues the bus event for a DOM pointer
     * event.
     * @param state the board's mouse state
     * @param event the DOM pointer event
     * @param x the pointer's x coordinate on the screen
     * @param y the pointer's y coordinate on the screen
     */
    export function onPointerEvent(state: MouseState, event: PointerEvent, x: number, y: number) {
        state.onEvent(event.type as MouseEvent, event.button, x, y);
    }
}

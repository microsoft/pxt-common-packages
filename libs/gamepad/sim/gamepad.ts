namespace pxsim.gamepad {
    export function setButton(index: number, up: boolean): void {
        const state = gamepadState();
        state.setButton(index, up);
    }    
}
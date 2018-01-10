namespace pxsim {
    export interface GamepadBoard extends CommonBoard {
        gamepadState: GamepadState;
    }

    export function gamepadState() {
        return (board() as GamepadBoard).gamepadState;
    }

    export class GamepadState {
        buttons: boolean[] = [];

        isButtonUp(index: number): boolean {
            return !!this.buttons[index];
        }

        setButton(index: number, up: boolean) {
            this.buttons[index] = up;
        }
    }
}

namespace pxsim.keymap {
    // Keep in sync with pxt-arcade-sim/api.ts
    export enum Key {
        None = 0,

        // Player 1
        Left = 1,
        Up = 2,
        Right = 3,
        Down = 4,
        A = 5,
        B = 6,

        Menu = 7,

        // Player 2 = Player 1 + 7
        // Player 3 = Player 2 + 7
        // Player 4 = Player 3 + 7

        // system keys
        Screenshot = -1,
        Gif = -2,
        Reset = -3,
        TogglePause = -4
    }

    export function _setPlayerKeys(
        player: number, // player number is 1-based
        up: number,
        down: number,
        left: number,
        right: number,
        A: number,
        B: number
    ) {
        getKeymapState().setPlayerKeys(player, up, down, left, right, A, B);
    }

    export function _setSystemKeys(screenshot: number, gif: number, menu: number, reset: number) {
        getKeymapState().setSystemKeys(screenshot, gif, menu, reset);
    }
}

namespace pxsim {
    import Key = pxsim.keymap.Key;

    export interface KeymapBoard extends EventBusBoard {
        keymapState: KeymapState;
    }

    export function getKeymapState() {
        return (board() as EventBusBoard as KeymapBoard).keymapState;
    }

    const reservedKeyCodes = [
        27, // Escape
        9 // Tab
    ];

    export class KeymapState {
        keymap: { [keyCode: number]: Key } = {};
        altmap: { [keyCode: number]: Key } = {};
        mappings: { [name: string]: number[] } = {};

        constructor() {
            // Player 1 keymap
            this.setPlayerKeys(
                1, // Player 1
                87, // W - Up
                83, // S - Down
                65, // A - Left
                68, // D - Right
                32, // Space - A
                13 // Enter - B
            );
            // Player 2 keymap
            this.setPlayerKeys(
                2, // Player 2
                73, // I - Up
                75, // K - Down
                74, // J - Left
                76, // L - Right
                85, // U - A
                79 // O - B
            );
            // Note: Player 3 and 4 have no default keyboard mapping

            // System keymap
            this.setSystemKeys(
                80, // P - Screenshot
                82, // R - Gif
                192, // Menu - '`' (backtick) button
                8 // Reset - Backspace button
            );

            // Player 1 alternate mapping. This is cleared when the game sets any player keys explicitly
            this.altmap[38] = Key.Up; // UpArrow
            this.altmap[37] = Key.Left; // LeftArrow
            this.altmap[40] = Key.Down; // DownArrow
            this.altmap[39] = Key.Right; // RightArrow
            this.altmap[81] = Key.A; // Q
            this.altmap[90] = Key.A; // Z
            this.altmap[88] = Key.B; // X
            this.altmap[69] = Key.B; // E
        }

        public setPlayerKeys(
            player: number, // player number is 1-based
            up: number,
            down: number,
            left: number,
            right: number,
            A: number,
            B: number
        ) {
            // We only support four players
            if (player < 1 || player > 4) return;
            const keyCodes = [up, down, left, right, A, B];
            // Check for reserved key codes
            // TODO: How to surface this runtime error to the user?
            // TODO: Send message to UI: "Keyboard mapping contains a reserved key code"
            const filtered = keyCodes.filter(keyCode => reservedKeyCodes.includes(keyCode));
            if (filtered.length) return;
            // Clear existing mapped keys for player
            const mapName = `player-${player}`;
            this.clearMap(mapName);
            // Clear altmap When explicitly setting the player keys
            this.altmap = {};
            // Map the new keys
            const offset = (player - 1) * 7; // +7 for player 2's keys
            this.keymap[up] = Key.Up + offset;
            this.keymap[down] = Key.Down + offset;
            this.keymap[left] = Key.Left + offset;
            this.keymap[right] = Key.Right + offset;
            this.keymap[A] = Key.A + offset;
            this.keymap[B] = Key.B + offset;
            // Remember this mapping
            this.saveMap(mapName, keyCodes);
        }

        public setSystemKeys(screenshot: number, gif: number, menu: number, reset: number) {
            const mapName = "system";
            // Clear existing mapped keys for system
            this.clearMap(mapName);
            this.keymap[screenshot] = Key.Screenshot;
            this.keymap[gif] = Key.Gif;
            this.keymap[menu] = Key.Menu;
            this.keymap[reset] = Key.Reset;
            // Remember this mapping
            this.saveMap(mapName, [screenshot, gif, menu, reset]);
        }

        public getKey(keyCode: number): Key {
            return keyCode ? this.keymap[keyCode] || this.altmap[keyCode] || Key.None : Key.None;
        }

        private saveMap(name: string, keyCodes: number[]) {
            this.mappings[name] = keyCodes;
        }

        private clearMap(name: string) {
            const keyCodes = this.mappings[name];
            keyCodes && keyCodes.forEach(keyCode => delete this.keymap[keyCode]);
            delete this.mappings[name];
        }
    }
}

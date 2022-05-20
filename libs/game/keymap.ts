namespace keymap {
    //% shim=keymap::_setPlayerKeys
    declare function _setPlayerKeys(
        player: number, // player number is 1-based
        up: number,
        down: number,
        left: number,
        right: number,
        A: number,
        B: number
    ): void;

    //% shim=keymap::_setSystemKeys
    declare function _setSystemKeys(screenshot: number, gif: number, menu: number, reset: number): void;

    /**
     * Sets the keyboard input map for the given player.
     * @param player The player number. 1 = Player1, etc.
     * @param up The key code for 'up'.
     * @param down The key code for 'down'
     * @param left The key code for 'left'
     * @param right The key code for 'right'
     * @param A The key code for 'A'
     * @param B The key code for 'B'
     */
    export function setPlayerKeys(
        player: number, // player number is 1-based
        up: KeyCode,
        down: KeyCode,
        left: KeyCode,
        right: KeyCode,
        A: KeyCode,
        B: KeyCode
    ) {
        _setPlayerKeys(player, up, down, left, right, A, B);
    }

    /**
     * Sets the keyboard input map for system keys.
     * @param screenshot The key code for 'screenshot'
     * @param gif The key code for 'gif'
     * @param menu The key code for 'menu'
     * @param reset The key code for 'reset'
     */
    export function setSystemKeys(screenshot: KeyCode, gif: KeyCode, menu: KeyCode, reset: KeyCode) {
        _setSystemKeys(screenshot, gif, menu, reset);
    }

    /**
     * Key codes
     */
    export enum KeyCode {
        None = 0,

        Backspace = 8,
        Tab = 9,
        Enter = 13,
        Shift = 16,
        Ctrl = 17,
        Alt = 18,
        PauseBreak = 19,
        CapsLock = 20,
        Escape = 27,
        Space = 32,
        PageUp = 33,
        PageDown = 34,
        End = 35,
        Home = 36,

        LeftArrow = 37,
        UpArrow = 38,
        RightArrow = 39,
        DownArrow = 40,

        Insert = 45,
        Delete = 46,

        Zero = 48,
        One = 49,
        Two = 50,
        Three = 51,
        Four = 52,
        Five = 53,
        Six = 54,
        Seven = 55,
        Eight = 56,
        Nine = 57,

        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,

        LeftWindowsKey = 91,
        RightWindowsKey = 92,

        Numpad0 = 96,
        Numpad1 = 97,
        Numpad2 = 98,
        Numpad3 = 99,
        Numpad4 = 100,
        Numpad5 = 101,
        Numpad6 = 102,
        Numpad7 = 103,
        Numpad8 = 104,
        Numpad9 = 105,

        Multiply = 106,
        Add = 107,
        Subtract = 109,
        DecimalPoint = 110,
        Divide = 111,

        F1 = 112,
        F2 = 113,
        F3 = 114,
        F4 = 115,
        F5 = 116,
        F6 = 117,
        F7 = 118,
        F8 = 119,
        F9 = 120,
        F10 = 121,
        F11 = 122,
        F12 = 123,

        NumLock = 144,
        ScrollLock = 145,

        SemiColon = 186,
        Equals = 187,
        Comma = 188,
        Dash = 189,
        Period = 190,
        ForwardSlash = 191,
        Tilde = 192,

        OpenBracket = 219,
        ClosedBracket = 221,
        SingleQuote = 222,

        // Mouse
        MouseLeftButton = -1,
        MouseRightButton = -2,
        MouseCenterButton = -3,
    }
}

namespace pxsim.browserEvents {
    export enum Key {
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
        BackTick = 192,
        Hyphen = 189,
        Equals = 187,
        Q = 81,
        W = 87,
        E = 69,
        R = 82,
        T = 84,
        Y = 89,
        U = 85,
        I = 73,
        O = 79,
        P = 80,
        OpenBracket = 219,
        CloseBracket = 221,
        BackSlash = 220,
        A = 65,
        S = 83,
        D = 68,
        F = 70,
        G = 71,
        H = 72,
        Space = 32,
        PageUp = 33,
        J = 74,
        K = 75,
        L = 76,
        SemiColon = 186,
        Apostrophe = 222,
        Z = 90,
        X = 88,
        C = 67,
        V = 86,
        B = 66,
        N = 78,
        M = 77,
        Comma = 188,
        Period = 190,
        ForwardSlash = 191,
        Shift = 16,
        Enter = 13,
        CapsLock = 20,
        Tab = 9,
        Control = 17,
        Meta = 91,
        Alt = 18,
        ArrowUp = 38,
        ArrowDown = 40,
        ArrowLeft = 37,
        ArrowRight = 39,
        PageDown = 34,
        End = 35,
        Home = 36
    }

    export function onKeyboardEvent(event: KeyboardEvent, pressed: boolean) {
        if (pressed) {
            board().bus.queue(6866, getValueForKey(event));
        }
        else {
            board().bus.queue(6867, getValueForKey(event));
        }
    }

    export function getValueForKey(event: KeyboardEvent) {
        switch (event.key) {
            case "0":
            case ")":
                return Key.Zero;
            case "1":
            case "!":
                return Key.One;
            case "2":
            case "@":
                return Key.Two;
            case "3":
            case "#":
                return Key.Three;
            case "4":
            case "$":
                return Key.Four;
            case "5":
            case "%":
                return Key.Five;
            case "6":
            case "^":
                return Key.Six;
            case "7":
            case "&":
                return Key.Seven;
            case "8":
            case "*":
                return Key.Eight;
            case "9":
            case "(":
                return Key.Nine;
            case "`":
            case "~":
                return Key.BackTick;
            case "-":
            case "_":
                return Key.Hyphen;
            case "=":
            case "+":
                return Key.Equals;
            case "Q":
            case "q":
                return Key.Q;
            case "W":
            case "w":
                return Key.W;
            case "E":
            case "e":
                return Key.E;
            case "R":
            case "r":
                return Key.R;
            case "T":
            case "t":
                return Key.T;
            case "Y":
            case "y":
                return Key.Y;
            case "U":
            case "u":
                return Key.U;
            case "I":
            case "i":
                return Key.I;
            case "O":
            case "o":
                return Key.O;
            case "P":
            case "p":
                return Key.P;
            case "[":
            case "{":
                return Key.OpenBracket;
            case "]":
            case "}":
                return Key.CloseBracket;
            case "\\":
            case "|":
                return Key.BackSlash;
            case "A":
            case "a":
                return Key.A;
            case "S":
            case "s":
                return Key.S;
            case "D":
            case "d":
                return Key.D;
            case "F":
            case "f":
                return Key.F;
            case "G":
            case "g":
                return Key.G;
            case "H":
            case "h":
                return Key.H;
            case " ":
                return Key.Space;
            case "PageUp":
                return Key.PageUp;
            case "J":
            case "j":
                return Key.J;
            case "K":
            case "k":
                return Key.K;
            case "L":
            case "l":
                return Key.L;
            case ";":
            case ":":
                return Key.SemiColon;
            case "'":
            case "\"":
                return Key.Apostrophe;
            case "Z":
            case "z":
                return Key.Z;
            case "X":
            case "x":
                return Key.X;
            case "C":
            case "c":
                return Key.C;
            case "V":
            case "v":
                return Key.V;
            case "B":
            case "b":
                return Key.B;
            case "N":
            case "n":
                return Key.N;
            case "M":
            case "m":
                return Key.M;
            case ",":
            case "<":
                return Key.Comma;
            case ".":
            case ">":
                return Key.Period;
            case "/":
            case "?":
                return Key.ForwardSlash;
            case "Shift":
                return Key.Shift;
            case "Enter":
                return Key.Enter;
            case "CapsLock":
                return Key.CapsLock;
            case "Tab":
                return Key.Tab;
            case "Control":
                return Key.Control;
            case "Meta":
                return Key.Meta;
            case "Alt":
                return Key.Alt;
            case "ArrowUp":
                return Key.ArrowUp;
            case "ArrowDown":
                return Key.ArrowDown;
            case "ArrowLeft":
                return Key.ArrowLeft;
            case "ArrowRight":
                return Key.ArrowRight;
            case "PageDown":
                return Key.PageDown;
            case "End":
                return Key.End;
            case "Home":
                return Key.Home;
            default:
                return 0;
        }
    }
}
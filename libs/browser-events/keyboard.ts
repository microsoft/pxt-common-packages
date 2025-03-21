namespace browserEvents {
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

    export enum KeyEvent {
        Pressed,
        Released
    }

    export function keyToString(key: Key) {
        switch (key) {
            case Key.Q:
                return "Q";
            case Key.W:
                return "W";
            case Key.E:
                return "E";
            case Key.R:
                return "R";
            case Key.T:
                return "T";
            case Key.Y:
                return "Y";
            case Key.U:
                return "U";
            case Key.I:
                return "I";
            case Key.O:
                return "O";
            case Key.P:
                return "P";
            case Key.OpenBracket:
                return "[";
            case Key.CloseBracket:
                return "]";
            case Key.BackSlash:
                return "\\";
            case Key.A:
                return "A";
            case Key.S:
                return "S";
            case Key.D:
                return "D";
            case Key.F:
                return "F";
            case Key.G:
                return "G";
            case Key.H:
                return "H";
            case Key.Space:
                return " ";
            case Key.PageUp:
                return "PageUp";
            case Key.J:
                return "J";
            case Key.K:
                return "K";
            case Key.L:
                return "L";
            case Key.SemiColon:
                return ";";
            case Key.Apostrophe:
                return "'";
            case Key.Z:
                return "Z";
            case Key.X:
                return "X";
            case Key.C:
                return "C";
            case Key.V:
                return "V";
            case Key.B:
                return "B";
            case Key.N:
                return "N";
            case Key.M:
                return "M";
            case Key.Comma:
                return ",";
            case Key.Period:
                return ".";
            case Key.ForwardSlash:
                return "/";
            case Key.Shift:
                return "Shift";
            case Key.Enter:
                return "Enter";
            case Key.CapsLock:
                return "CapsLock";
            case Key.Tab:
                return "Tab";
            case Key.Control:
                return "Control";
            case Key.Meta:
                return "Meta";
            case Key.Alt:
                return "Alt";
            case Key.ArrowUp:
                return "ArrowUp";
            case Key.ArrowDown:
                return "ArrowDown";
            case Key.ArrowLeft:
                return "ArrowLeft";
            case Key.ArrowRight:
                return "ArrowRight";
            case Key.PageDown:
                return "PageDown";
            case Key.End:
                return "End";
            case Key.Home:
                return "Home";
            case Key.Zero:
                return "0";
            case Key.One:
                return "1";
            case Key.Two:
                return "2";
            case Key.Three:
                return "3";
            case Key.Four:
                return "4";
            case Key.Five:
                return "5";
            case Key.Six:
                return "6";
            case Key.Seven:
                return "7";
            case Key.Eight:
                return "8";
            case Key.Nine:
                return "9";
            case Key.BackTick:
                return "`";
            case Key.Hyphen:
                return "-";
            case Key.Equals:
                return "=";
        }
    }


    //% fixedInstances
    export class KeyButton {
        protected _pressed: boolean;
        protected pressHandler: () => void;
        protected pressListeners: (() => void)[];
        protected releaseHandler: () => void;
        protected releaseListeners: (() => void)[];

        constructor(public id: number) {
            control.onEvent(Event.KeyUp, this.id, () => this.setPressed(false), 16);
            control.onEvent(Event.KeyDown, this.id, () => this.setPressed(true), 16);

            this._pressed = false;
            this.pressListeners = [];
            this.releaseListeners = [];
        }

        setPressed(pressed: boolean) {
            this._pressed = pressed;
            if (pressed) {
                if (this.pressHandler) {
                    this.pressHandler();
                }
                for (const handler of this.pressListeners) {
                    handler();
                }
            }
            else {
                if (this.releaseHandler) {
                    this.releaseHandler();
                }
                for (const handler of this.releaseListeners) {
                    handler();
                }
            }
        }

        //% blockId=browserEvents_key_onEvent
        //% block="on $this key $event"
        //% group="Keyboard"
        //% weight=100
        onEvent(event: KeyEvent, handler: () => void) {
            if (event === KeyEvent.Pressed) {
                this.pressHandler = handler;
            }
            else {
                this.releaseHandler = handler;
            }
        }

        //% blockId=browserEvents_key_isPressed
        //% block="is $this key pressed"
        //% group="Keyboard"
        //% weight=90
        isPressed() {
            return this._pressed;
        }

        //% blockId=browserEvents_key_pauseUntil
        //% block="pause until $this key is $event"
        //% group="Keyboard"
        //% weight=80
        pauseUntil(event: KeyEvent) {
            control.waitForEvent(event, this.id)
        }

        addEventListener(event: KeyEvent, handler: () => void) {
            if (event === KeyEvent.Pressed) {
                this.pressListeners.push(handler);
            }
            else {
                this.releaseListeners.push(handler);
            }
        }

        removeEventListener(event: KeyEvent, handler: () => void) {
            if (event === KeyEvent.Pressed) {
                this.pressListeners = this.pressListeners.filter(p => p !== handler);
            }
            else {
                this.releaseListeners = this.releaseListeners.filter(p => p !== handler);
            }
        }
    }

    //% fixedInstance whenUsed
    export const A = new KeyButton(Key.A);

    //% fixedInstance whenUsed
    export const B = new KeyButton(Key.B);

    //% fixedInstance whenUsed
    export const C = new KeyButton(Key.C);

    //% fixedInstance whenUsed
    export const D = new KeyButton(Key.D);

    //% fixedInstance whenUsed
    export const E = new KeyButton(Key.E);

    //% fixedInstance whenUsed
    export const F = new KeyButton(Key.F);

    //% fixedInstance whenUsed
    export const G = new KeyButton(Key.G);

    //% fixedInstance whenUsed
    export const H = new KeyButton(Key.H);

    //% fixedInstance whenUsed
    export const I = new KeyButton(Key.I);

    //% fixedInstance whenUsed
    export const J = new KeyButton(Key.J);

    //% fixedInstance whenUsed
    export const K = new KeyButton(Key.K);

    //% fixedInstance whenUsed
    export const L = new KeyButton(Key.L);

    //% fixedInstance whenUsed
    export const M = new KeyButton(Key.M);

    //% fixedInstance whenUsed
    export const N = new KeyButton(Key.N);

    //% fixedInstance whenUsed
    export const O = new KeyButton(Key.O);

    //% fixedInstance whenUsed
    export const P = new KeyButton(Key.P);

    //% fixedInstance whenUsed
    export const Q = new KeyButton(Key.Q);

    //% fixedInstance whenUsed
    export const R = new KeyButton(Key.R);

    //% fixedInstance whenUsed
    export const S = new KeyButton(Key.S);

    //% fixedInstance whenUsed
    export const T = new KeyButton(Key.T);

    //% fixedInstance whenUsed
    export const U = new KeyButton(Key.U);

    //% fixedInstance whenUsed
    export const V = new KeyButton(Key.V);

    //% fixedInstance whenUsed
    export const W = new KeyButton(Key.W);

    //% fixedInstance whenUsed
    export const X = new KeyButton(Key.X);

    //% fixedInstance whenUsed
    export const Y = new KeyButton(Key.Y);

    //% fixedInstance whenUsed
    export const Z = new KeyButton(Key.Z);

    //% fixedInstance whenUsed
    export const Zero = new KeyButton(Key.Zero);

    //% fixedInstance whenUsed
    export const One = new KeyButton(Key.One);

    //% fixedInstance whenUsed
    export const Two = new KeyButton(Key.Two);

    //% fixedInstance whenUsed
    export const Three = new KeyButton(Key.Three);

    //% fixedInstance whenUsed
    export const Four = new KeyButton(Key.Four);

    //% fixedInstance whenUsed
    export const Five = new KeyButton(Key.Five);

    //% fixedInstance whenUsed
    export const Six = new KeyButton(Key.Six);

    //% fixedInstance whenUsed
    export const Seven = new KeyButton(Key.Seven);

    //% fixedInstance whenUsed
    export const Eight = new KeyButton(Key.Eight);

    //% fixedInstance whenUsed
    export const Nine = new KeyButton(Key.Nine);

    //% fixedInstance whenUsed
    export const Shift = new KeyButton(Key.Shift);

    //% fixedInstance whenUsed
    export const Enter = new KeyButton(Key.Enter);

    //% fixedInstance whenUsed
    export const CapsLock = new KeyButton(Key.CapsLock);

    //% fixedInstance whenUsed
    export const Tab = new KeyButton(Key.Tab);

    //% fixedInstance whenUsed
    export const Control = new KeyButton(Key.Control);

    //% fixedInstance whenUsed
    export const Meta = new KeyButton(Key.Meta);

    //% fixedInstance whenUsed
    export const Alt = new KeyButton(Key.Alt);

    //% fixedInstance whenUsed
    export const ArrowUp = new KeyButton(Key.ArrowUp);

    //% fixedInstance whenUsed
    export const ArrowDown = new KeyButton(Key.ArrowDown);

    //% fixedInstance whenUsed
    export const ArrowLeft = new KeyButton(Key.ArrowLeft);

    //% fixedInstance whenUsed
    export const ArrowRight = new KeyButton(Key.ArrowRight);

    //% fixedInstance whenUsed
    export const BackTick = new KeyButton(Key.BackTick);

    //% fixedInstance whenUsed
    export const Hyphen = new KeyButton(Key.Hyphen);

    //% fixedInstance whenUsed
    export const Equals = new KeyButton(Key.Equals);

    //% fixedInstance whenUsed
    export const OpenBracket = new KeyButton(Key.OpenBracket);

    //% fixedInstance whenUsed
    export const CloseBracket = new KeyButton(Key.CloseBracket);

    //% fixedInstance whenUsed
    export const BackSlash = new KeyButton(Key.BackSlash);

    //% fixedInstance whenUsed
    export const Space = new KeyButton(Key.Space);

    //% fixedInstance whenUsed
    export const PageUp = new KeyButton(Key.PageUp);

    //% fixedInstance whenUsed
    export const SemiColon = new KeyButton(Key.SemiColon);

    //% fixedInstance whenUsed
    export const Apostrophe = new KeyButton(Key.Apostrophe);

    //% fixedInstance whenUsed
    export const Comma = new KeyButton(Key.Comma);

    //% fixedInstance whenUsed
    export const Period = new KeyButton(Key.Period);

    //% fixedInstance whenUsed
    export const ForwardSlash = new KeyButton(Key.ForwardSlash);

    //% fixedInstance whenUsed
    export const PageDown = new KeyButton(Key.PageDown);

    //% fixedInstance whenUsed
    export const End = new KeyButton(Key.End);

    //% fixedInstance whenUsed
    export const Home = new KeyButton(Key.Home);

    //% fixedInstance whenUsed
    export const Any = new KeyButton(0);
}
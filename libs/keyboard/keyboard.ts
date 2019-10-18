/**
 * Keyboard emulation
 */
//% icon="\uf11c" color="#303030"
namespace keyboard {
    // prevent catastrophic pounding of keyboard
    class State {
        private _keysDown: number[];
        private _mediasDown: number[];
        private _functionsDown: number[];
        constructor() {
            this._keysDown = undefined;
            this._mediasDown = undefined;
            this._functionsDown = undefined;
        }

        type(text: string) {
            if (!text) return;

            if (this._keysDown) {
                for (let i = 0; i < text.length; ++i) {
                    const c = text.charCodeAt(i);
                    const ic = this._keysDown.indexOf(c);
                    if (ic > -1)
                        this._keysDown.splice(ic, 1);
                }
            }
            __type(text);
        }

        key(key: string, event: KeyboardKeyEvent) {
            if (!key) return;

            if (!this._keysDown) this._keysDown = [];
            const c = key.charCodeAt(0);
            if (State.updateState(this._keysDown, c, event))
                __key(c, event);
        }

        mediaKey(key: KeyboardMediaKey, event: KeyboardKeyEvent) {
            if (!this._mediasDown) this._mediasDown = [];
            if (State.updateState(this._mediasDown, key, event))
                __mediaKey(key, event);
        }

        functionKey(key: KeyboardFunctionKey, event: KeyboardKeyEvent) {
            if (!this._functionsDown) this._functionsDown = [];
            if (State.updateState(this._functionsDown, key, event))
                __functionKey(key, event);
        }

        private static updateState(downKeys: number[], c: number, event: KeyboardKeyEvent): boolean {
            let i = downKeys.indexOf(c);
            switch (event) {
                // clear down
                case KeyboardKeyEvent.Press:
                    if (i > -1)
                        downKeys.splice(i, 1);
                    return true;
                // must be down
                case KeyboardKeyEvent.Up:
                    if (i > -1) {
                        downKeys.splice(i, 1);
                        return true;
                    } else {
                        return false;
                    }
                // must be down
                case KeyboardKeyEvent.Down:
                    if (i > -1) {
                        return false;
                    } else {
                        downKeys.push(c)
                        return true;
                    }
            }

            return false;
        }

        clear() {
            // send up command for all down keys and clear
            while (this._keysDown && this._keysDown.length) {
                const c = this._keysDown.pop();
                __key(c, KeyboardKeyEvent.Up);
            }
            while (this._mediasDown && this._mediasDown.length) {
                const c = this._mediasDown.pop();
                __mediaKey(c, KeyboardKeyEvent.Up);
            }
            while (this._functionsDown && this._functionsDown.length) {
                const c = this._functionsDown.pop();
                __functionKey(c, KeyboardKeyEvent.Up);
            }
        }
    }

    //% whenUsed
    let _state: State;
    function state(): State {
        if (!_state) _state = new State();
        return _state;
    }

    /**
    * Send a sequence of keystrokes to the keyboard
    */
    //% blockId=keyboardType block="keyboard type %text"
    //% blockGap=8 weight=100
    //% text.shadowOptions.toString=true
    //% help=keyboard/type
    export function type(text: string) {
        const st = state();
        st.type(text);
    }

    /**
    * Send a key command
    */
    //% blockId=keyboardStandardKey block="keyboard key %key|%event"
    //% blockGap=8 weight=99
    //% help=keyboard/key
    export function key(key: string, event: KeyboardKeyEvent) {
        const st = state();
        st.key(key, event);
    }

    /**
    * Send a media key command
    */
    //% blockId=keyboardMediaKey block="keyboard media key %key|%event"
    //% blockGap=8
    //% help=keyboard/media-key
    export function mediaKey(key: KeyboardMediaKey, event: KeyboardKeyEvent) {
        const st = state();
        st.mediaKey(key, event);
    }

    /**
    * Send a function key command
    */
    //% blockId=keyboardFunctionKey block="keyboard function key %key|%event"
    //% blockGap=8
    //% help=keyboard/function-key
    export function functionKey(key: KeyboardFunctionKey, event: KeyboardKeyEvent) {
        const st = state();
        st.functionKey(key, event)
    }

    /**
     * Send up commands for any remaning down keys
     */
    //% blockId=keyboardClear block="keyboard clear all"
    //% blockGap=8
    //% help=keyboard/clear-all-keys
    export function clearAllKeys() {
        const st = state();
        st.clear();
    }
}
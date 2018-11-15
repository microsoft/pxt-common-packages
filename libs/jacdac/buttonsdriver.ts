namespace jacdac {
    const BUTTONS_DRIVER_CLASS = 42;

    export class TouchButtonsDriver extends JacDacStreamingPairableDriver {
        private _buttons: TouchButton[];
        constructor(buttons?: TouchButton[]) {
            super(!!buttons, BUTTONS_DRIVER_CLASS);
            this._buttons = buttons;
        }

        /**
         * Gets the latest button reading by index
         * @param index 
         */
        buttonValue(index: number) {
            return (this._sendState ? this._sendState[index] : 0) || 0;
        }

        protected handleVirtualState(time: number, state: Buffer) {            
            return true;
        }

        protected serializeState(): Buffer {
            // read button state and send over
            const state = control.createBuffer(this._buttons.length);
            for (let i = 0; i < this._buttons.length; ++i)
                state.setNumber(NumberFormat.UInt8LE, i, this._buttons[i].value());
            return state;
        }
    }
}
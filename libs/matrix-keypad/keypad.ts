enum MatrixKeypadEvent {
    Pressed = PinEvent.PulseHigh,
    Released = PinEvent.PulseLow
}

namespace input {
    //% fixedInstances
    export class MatrixKeypad {
        rowPins: DigitalInOutPin[];
        columnPins: DigitalInOutPin[];
        messageBusId: number;
        timePressed: number[];

        constructor(messageBusId: number) {
            this.messageBusId = messageBusId;
            
            const rows = pxt.getConfig(DAL.CFG_NUM_MATRIX_KEYPAD_ROWS, 0);
            const columns = pxt.getConfig(DAL.CFG_NUM_MATRIX_KEYPAD_COLS, 0);
            
            this.rowPins = [];
            for(let i = 0; i < rows; ++i) {
                const p = pxt.getPinCfg(DAL.CFG_MATRIX_KEYPAD_ROW0 + i);
                this.rowPins.push(p);
            }
            this.columnPins = [];
            for(let i = 0; i < cols; ++i) {
                const p = pxt.getPinCfg(DAL.CFG_MATRIX_KEYPAD_COL0 + i);
                this.rowPins.push(p);
            }
            this.timePressed = [];
        }

        static setInput(p: DigitalInOutPin) {
            p.digitalRead();
            p.setPull(PinPullMode.PullUp)
        }

        private evId(x: number, y: number, ev: number) {
            return 1 + (x * this.rowPins.length + y) * 2;
        }

        private pulseRows() {
            this.rowPins.forEach(p => MatrixKeypad.setInput(p));
            this.columnPins.forEach(p => MatrixKeypad.setInput(p));

            this.rowPins.forEach((row, y) => this.pulseRow(y));
        }

        private pulseRow(y: number) {
            const row = this.rowPins[y];
            const time = control.millis();
            // set one row low
            row.digitalWrite(false);
            // check the column pins, which ones are pulled down
            this.columnPins.forEach((col, x) => {
                const pressed = col.digitalRead();
                const idx = x * this.columnPins.length + y;
                const wasPressed = !!this.timePressed[idx];
                if (wasPressed != pressed) {
                    control.raiseEvent(this.messageBusId, this.evId(x, y, pressed ? MatrixKeypadEvent.Pressed : MatrixKeypadEvent.Released));
                    this.timePressed[idx] = pressed ? time : 0;
                }
            });
            // reset the pin to be an input
            MatrixKeypad.setInput(row);
            // reset events
            row.onEvent(PinEvent.PulseHigh, () => this.pulseRow(y));
            row.onEvent(PinEvent.PulseLow, () => this.pulseRow(y));
        }

        /**
         * Register an event handler
         * @param x 
         * @param y 
         * @param ev 
         * @param handler 
         */
        //% blockId=mkeypadonevent block="on keypad %keypad button at x %x y %y %ev"
        onEvent(x: number, y: number, ev: MatrixKeypadEvent, handler: () => void) {
            x = x >> 0;
            y = y >> 0;
            if (x < 0 || y < 0 || x >= this.columnPins.length || y >= this.rowPins.length)
                return;

            control.onEvent(this.messageBusId, this.evId(x, y, ev), handler);
            this.pulseRow(y); // raise events as needed
        }

        /**
         * Indicates a button is pressed
         * @param x column index starting from 0
         * @param y row index starting from 0
         */
        //% blockId=mkeypadispressed block="is keypad %keypad button pressed at x %x y %y"
        isPressed(x: number, y: number): boolean {
            return !!this.timePressed[x * this.columnPins.length + y];
        }
    }
}
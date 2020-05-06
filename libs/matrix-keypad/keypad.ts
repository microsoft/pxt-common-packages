/**
 * User interaction on keypad buttons
 */
const enum MatrixKeypadButtonEvent {
    //% block="click"
    Click = DAL.DEVICE_BUTTON_EVT_CLICK,
    //% block="long click"
    LongClick = DAL.DEVICE_BUTTON_EVT_LONG_CLICK,
    //% block="up"
    Up = DAL.DEVICE_BUTTON_EVT_UP,
    //% block="down"
    Down = DAL.DEVICE_BUTTON_EVT_DOWN
};

namespace matrixKeypad {
    //% fixedInstances
    export class MatrixKeypad {
        private timePressed: number[];

        static fromCfg(): MatrixKeypad {
            const messageBusId = control.getConfigValue(DAL.CFG_MATRIX_KEYPAD_MESSAGE_ID, 7452);
            
            const rows = control.getConfigValue(DAL.CFG_NUM_MATRIX_KEYPAD_ROWS, 0);
            const columns = control.getConfigValue(DAL.CFG_NUM_MATRIX_KEYPAD_COLS, 0);
            
            const rowPins: DigitalInOutPin[] = [];
            for(let i = 0; i < rows; ++i) {
                const p = pins.pinByCfg(DAL.CFG_PIN_MATRIX_KEYPAD_ROW0 + i);
                control.assert(!!p, control.PXT_PANIC.CODAL_HARDWARE_CONFIGURATION_ERROR)
                rowPins.push(p);
            }
            const columnPins: DigitalInOutPin[] = [];
            for(let i = 0; i < columns; ++i) {
                const p = pins.pinByCfg(DAL.CFG_PIN_MATRIX_KEYPAD_COL0 + i);
                control.assert(!!p, control.PXT_PANIC.CODAL_HARDWARE_CONFIGURATION_ERROR)
                columnPins.push(p);
            }
            return new MatrixKeypad(messageBusId, rowPins, columnPins);
        }

        constructor(private messageBusId: number, private rowPins: DigitalInOutPin[], private columnPins: DigitalInOutPin[]) {
            this.timePressed = [];
            this.pulseRows();
            control.runInParallel(function() {
                while(true) {
                    this.pulseRows();
                    pause(50);
                }
            })
        }

        static setInput(p: DigitalInOutPin) {
            p.digitalRead();
            p.setPull(PinPullMode.PullDown)
        }

        private evId(x: number, y: number, ev: number) {
            return 1 + (x + y * this.columns) * 8 + ev;
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
            row.digitalWrite(true);
            // check the column pins, which ones are pulled down
            this.columnPins.forEach((col, x) => {
                const pressed = col.digitalRead();
                const idx = x + y * this.columns;
                const lastTime = this.timePressed[idx];
                const wasPressed = !!lastTime;
                if (wasPressed != pressed) {
                    this.timePressed[idx] = pressed ? time : 0;
                    control.raiseEvent(this.messageBusId, this.evId(x, y, pressed ? MatrixKeypadButtonEvent.Down : MatrixKeypadButtonEvent.Up));
                    if (!pressed) {
                        const elapsed = time - lastTime;
                        if (elapsed >= DAL.DEVICE_BUTTON_LONG_CLICK_TIME) {
                            control.raiseEvent(this.messageBusId, this.evId(x, y, MatrixKeypadButtonEvent.LongClick));
                        } else {
                            control.raiseEvent(this.messageBusId, this.evId(x, y, MatrixKeypadButtonEvent.Click));
                        }
                    }
                }
            });
            MatrixKeypad.setInput(row);
        }

        /**
         * Gets the number of rows
         */
        //% blockId=mkeypadrows
        //% blockSetVariable="rows" blockCombine block="rows"
        get rows(): number {
            return this.rowPins.length;
        }

        /**
         * Gets the number of columns
         */
        //% blockId=mkeypadcolumns
        //% blockSetVariable="columns" blockCombine block="columns"
        get columns(): number {
            return this.columnPins.length;
        }

        /**
         * Register an event handler
         * @param x 
         * @param y 
         * @param ev 
         * @param handler 
         */
        //% blockId=mkeypadonevent block="on keypad %keypad button at x %x y %y %ev"
        onEvent(x: number, y: number, ev: MatrixKeypadButtonEvent, handler: () => void) {
            x = x | 0;
            y = y | 0;
            if (x < 0 || y < 0 || x >= this.columns || y >= this.rows)
                return;

            control.onEvent(this.messageBusId, this.evId(x, y, ev), handler);
            this.pulseRows(); // raise events as needed
        }

        /**
         * Indicates a button is pressed
         * @param x column index starting from 0
         * @param y row index starting from 0
         */
        //% blockId=mkeypadispressed block="is keypad %keypad button pressed at x %x y %y"
        isPressed(x: number, y: number): boolean {
            x = x | 0;
            y = y | 0;
            if (x < 0 || y < 0 || x >= this.columns || y >= this.rows)
                return false;
            return !!this.timePressed[x + y * this.columns];
        }
    }

    //% fixedInstance whenUsed block="keypad"
    export const keypad = MatrixKeypad.fromCfg();
}
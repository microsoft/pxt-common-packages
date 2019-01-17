enum MatrixKeypadButtonEvent {
    Pressed = PinEvent.PulseHigh,
    Released = PinEvent.PulseLow
}

namespace input {
    export class MatrixKeypad {
        rowPins: DigitalInOutPin[];
        columnPins: DigitalInOutPin[];
        messageBusId: number;
        

        constructor(rowPins: DigitalInOutPin[], columnPins: DigitalInOutPin[], messageBusId: number) {
            this.rowPins = rowPins;
            this.columnPins = columnPins;
            this.messageBusId = this.messageBusId;
        }

        static setInput(p: DigitalInOutPin) {
            p.digitalRead();
            p.setPull(PinPullMode.PullUp)
        }

        private evId(x: number, y: number, ev: number) {
            return 1 + (x * this.rowPins.length + y) * 2;
        }

        private clearPins(events: boolean) {
            this.rowPins.forEach(p => MatrixKeypad.setInput(p));
            this.columnPins.forEach(p => MatrixKeypad.setInput(p));

            this.rowPins.forEach((row, y) => {
                row.onEvent(PinEvent.PulseHigh, () => this.pulseRow(y, PinEvent.PulseHigh));
                row.onEvent(PinEvent.PulseLow, () => this.pulseRow(y, PinEvent.PulseLow));
            })
        }

        private pulseRow(x: number, ev: number) {

        }

        onButtonEvent(x: number, y: number, ev: MatrixKeypadButtonEvent, handler: () => void) {
            x = x >> 0;
            y = y >> 0;
            if (x < 0 || y < 0 || x >= this.columnPins.length || y >= this.rowPins.length)
                return;            
            control.onEvent(this.messageBusId, this.evId(x, y, ev), handler);
        }

        pressedButtons(): number[][] {
            this.clearPins(false);

            const pressed: number[][] = [];
            this.rowPins.forEach((row, i) => {
                // set one row low
                row.digitalWrite(false);
                // check the column pins, which ones are pulled down
                this.columnPins.forEach((col, j) => {
                    if (!col.digitalRead())
                        pressed.push([i, j]);
                });
                // reset the pin to be an input
                MatrixKeypad.setInput(row);
            })
            return pressed;
        }
    }
}
namespace pxsim {
    export class LCDState {
        lines = 0;
        columns = 0;
        cursorPos: [number, number];
        text: string[];
        backLightColor: string = "#6e7d6e";
        cursor = false;
        display = false;
        blink = false;

        public sensorUsed: boolean = false;

        constructor(lines = 2, columns = 16) {
            this.lines = lines;
            this.columns = columns;
            this.clear();
        }

        clear() {
            let s = "";
            for (let i = 0; i < this.columns; ++i)
                s += " ";
            this.text = [];
            for (let i = 0; i < this.lines; ++i)
                this.text.push(s);
            this.cursorPos = [0, 0];
        }

        public setUsed() {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                runtime.queueDisplayUpdate();
            }
        }
    }

    export interface LCDBoard extends CommonBoard {
        lcdState: LCDState;
    }

    export function lcdState(): LCDState {
        return (board() as LCDBoard).lcdState;
    }
}

namespace pxsim.lcd {
    const _LCD_CLEARDISPLAY = 0x01
    const _LCD_RETURNHOME = 0x02
    const _LCD_ENTRYMODESET = 0x04
    const _LCD_DISPLAYCONTROL = 0x08
    const _LCD_CURSORSHIFT = 0x10
    const _LCD_FUNCTIONSET = 0x20
    const _LCD_SETCGRAMADDR = 0x40
    const _LCD_SETDDRAMADDR = 0x80
    // Entry flags
    const _LCD_ENTRYLEFT = 0x02
    const _LCD_ENTRYSHIFTDECREMENT = 0x00
    // Control flags
    const _LCD_DISPLAYON = 0x04
    const _LCD_CURSORON = 0x02
    const _LCD_CURSOROFF = 0x00
    const _LCD_BLINKON = 0x01
    const _LCD_BLINKOFF = 0x00
    const _LCD_ROW_OFFSETS = [0x00, 0x40, 0x14, 0x54]

    export function __write8(value: number, char_mode: boolean) {
        let b = lcdState();
        if (!b) return;

        b.setUsed();

        if (char_mode) {
            const c = b.cursorPos[0];
            const r = b.cursorPos[1];
            const s = b.text[r];
            if (s && c >= 0 && c < s.length) {
                b.text[r] = s.substring(0, c) + String_.fromCharCode(value) + s.substring(c + 1);
                b.cursorPos[0]++;
            }
        } else {
            if (value & _LCD_SETDDRAMADDR) {
                value = ~(~value | _LCD_SETDDRAMADDR);
                // setCursorPosition
                // this._write8(_LCD_SETDDRAMADDR | column + _LCD_ROW_OFFSETS[row])
                for (let i = _LCD_ROW_OFFSETS.length - 1; i >= 0; i--) {
                    if (((value & _LCD_ROW_OFFSETS[i]) == _LCD_ROW_OFFSETS[i]) || i == 0) {
                        b.cursorPos[0] = value - _LCD_ROW_OFFSETS[i];
                        b.cursorPos[1] = i;
                        break;
                    }
                }
            }
            if (value == _LCD_CLEARDISPLAY) {
                b.clear();
            }
            if ((value & _LCD_DISPLAYCONTROL) == _LCD_DISPLAYCONTROL) {
                b.display = (value & _LCD_DISPLAYON) == _LCD_DISPLAYON;
                b.cursor = (value & _LCD_CURSORON) == _LCD_CURSORON;
                b.blink = (value & _LCD_BLINKON) == _LCD_BLINKON;
            }
            if (value == _LCD_RETURNHOME) {
                b.cursorPos = [0, 0];
            }
        }
        runtime.queueDisplayUpdate()
    }
}

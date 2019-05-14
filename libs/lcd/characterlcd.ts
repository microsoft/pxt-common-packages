namespace lcd {

    //% shim=lcd::__write8
    function __write8(value: number, char_mode: boolean): void {
    }

    // Commands
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
    // Move flags
    const _LCD_DISPLAYMOVE = 0x08
    const _LCD_MOVERIGHT = 0x04
    const _LCD_MOVELEFT = 0x00
    // Function set flags
    const _LCD_4BITMODE = 0x00
    const _LCD_2LINE = 0x08
    const _LCD_1LINE = 0x00
    const _LCD_5X8DOTS = 0x00
    // Offset for up to 4 rows.
    const _LCD_ROW_OFFSETS = [0x00, 0x40, 0x14, 0x54]

    export class CharacterLCD {
        columns: number
        lines: number
        reset: DigitalInOutPin;
        enable: DigitalInOutPin;
        dl4: DigitalInOutPin;
        dl5: DigitalInOutPin;
        dl6: DigitalInOutPin;
        dl7: DigitalInOutPin;
        displaycontrol: number
        displayfunction: number
        displaymode: number
        _message: string;
        _enable: boolean;
        _rtl: boolean;

        // pylint: disable-msg=too-many-arguments
        constructor(rs: DigitalInOutPin, en: DigitalInOutPin,
            d4: DigitalInOutPin, d5: DigitalInOutPin, d6: DigitalInOutPin, d7: DigitalInOutPin,
            columns: number, lines: number) {
            this._rtl = false;
            this.columns = columns;
            this.lines = lines;
            // save pin numbers
            this.reset = rs;
            this.enable = en;
            this.dl4 = d4;
            this.dl5 = d5;
            this.dl6 = d6;
            this.dl7 = d7;
            // set all pins as outputs
            for (const pin of [rs, en, d4, d5, d6, d7]) {
                pin.digitalWrite(false);
            }
            // Initialise the display
            this._write8(0x33)
            this._write8(0x32)
            // Initialise display control
            this.displaycontrol = _LCD_DISPLAYON | _LCD_CURSOROFF | _LCD_BLINKOFF
            // Initialise display function
            this.displayfunction = _LCD_4BITMODE | _LCD_1LINE | _LCD_2LINE | _LCD_5X8DOTS
            // Initialise display mode
            this.displaymode = _LCD_ENTRYLEFT | _LCD_ENTRYSHIFTDECREMENT
            // Write to displaycontrol
            this._write8(_LCD_DISPLAYCONTROL | this.displaycontrol)
            // Write to displayfunction
            this._write8(_LCD_FUNCTIONSET | this.displayfunction)
            // Set entry mode
            this._write8(_LCD_ENTRYMODESET | this.displaymode)
            this.clear()
            this._message = ""
            this._enable = null
        }

        /** 
         * Moves the cursor "home" to position (1, 1).
         **/
        public home(): void {
            this._write8(_LCD_RETURNHOME)
            pause(3)
        }

        /** Clears everything displayed on the LCD.
         * The following example displays, "Hello, world!", then clears the LCD.
         **/
        public clear(): void {
            this._write8(_LCD_CLEARDISPLAY)
            this._message = "";
            pause(3)
        }

        /** 
         * True if cursor is visible. False to stop displaying the cursor.
         */
        get cursor(): boolean {
            return (this.displaycontrol & _LCD_CURSORON) == _LCD_CURSORON;
        }

        set cursor(show: boolean) {
            const dc = this.displaycontrol;
            if (show)
                this.displaycontrol |= _LCD_CURSORON
            else
                this.displaycontrol &= ~_LCD_CURSORON
            if (dc != this.displaycontrol)
                this._write8(_LCD_DISPLAYCONTROL | this.displaycontrol)
        }

        /** 
         * Move the cursor to position ``column``, ``row`` 
         **/
        public setCursorPosition(column: number, row: number): void {
            column = Math.max(0, Math.min(this.columns - 1, column | 0));
            row = Math.max(0, Math.min(this.lines - 1, row | 0));

            //console.log(`cursor ${_LCD_SETDDRAMADDR | column + _LCD_ROW_OFFSETS[row]}`)
            this._write8(_LCD_SETDDRAMADDR | column + _LCD_ROW_OFFSETS[row])
        }

        /** 
        * Blink the cursor. True to blink the cursor. False to stop blinking.
        */
        get blink(): boolean {

            return (this.displaycontrol & _LCD_BLINKON) == _LCD_BLINKON
        }

        set blink(value: boolean) {
            const dc = this.displaycontrol;
            if (value)
                this.displaycontrol |= _LCD_BLINKON
            else
                this.displaycontrol &= ~_LCD_BLINKON
            if (dc != this.displaycontrol)
                this._write8(_LCD_DISPLAYCONTROL | this.displaycontrol)
        }

        /** 
        * Enable or disable the display. True to enable the display. False to disable the display.
        */
        get display(): boolean {
            return (this.displaycontrol & _LCD_DISPLAYON) == _LCD_DISPLAYON
        }

        set display(enable: boolean) {
            const dc = this.displaycontrol;
            if (enable)
                this.displaycontrol |= _LCD_DISPLAYON
            else
                this.displaycontrol &= ~_LCD_DISPLAYON

            if (dc != this.displaycontrol)
                this._write8(_LCD_DISPLAYCONTROL | this.displaycontrol)
        }

        /** 
         * Display a string of text on the character LCD.
         */
        get message(): string {
            return this._message
        }

        set message(message: string) {
            if (message === undefined || message === null) message = "";
            if (this._message === message) return; // nothing to do here

            const oldMessage = this._message;
            this._message = message;
            //console.log(`'${oldMessage}' => '${message}'`);

            const ltr = !!(this.displaymode & _LCD_ENTRYLEFT);
            const oldLines = oldMessage.split('\n');
            const lines = this._message.split('\n');
            const rn = Math.min(this.lines, Math.max(oldLines.length, lines.length));

            let cursorrow = -1;
            let cursorcol = -1;
            for (let row = 0; row < rn; ++row) {
                let oldLine = oldLines[row];
                if (oldLine === undefined) oldLine = "";
                let line = lines[row];
                if (line === undefined) line = "";
                const cn = Math.min(this.columns, Math.max(oldLine.length, line.length));
                for (let column = 0; column < cn; ++column) {
                    const oc = oldLine.charCodeAt(column);
                    const c = line.charCodeAt(column);
                    if (oc !== c) {
                        // letter is already shown, skip
                        // move cursor if needed
                        if (row != cursorrow || column != cursorcol) {
                            //console.log(`set cursor pos ${column}, ${row}`);
                            this.setCursorPosition(ltr ? column : this.columns - 1 - column, row);
                            cursorrow = row;
                            cursorcol = column;
                        }
                        //console.log(`write ${String.fromCharCode(c)} (${String.fromCharCode(oc)}) at ${cursorcol}, ${cursorrow}`);
                        if (column >= line.length)
                            this._write8(32 /* space */, true);
                        else
                            this._write8(c, true);
                        cursorcol++;
                    }
                }
            }
        }

        /** 
         * Moves displayed text left one column.
         **/
        public moveLeft(): void {
            this._write8(_LCD_CURSORSHIFT | _LCD_DISPLAYMOVE | _LCD_MOVELEFT)
        }

        /** 
         * Moves displayed text right one column.
         **/
        public moveRight(): void {
            this._write8(_LCD_CURSORSHIFT | _LCD_DISPLAYMOVE | _LCD_MOVERIGHT)
        }

        get rightToLeft(): boolean {
            return this._rtl;
        }

        set rightToLeft(direction: boolean) {
            if (this._rtl != direction) {
                this._rtl = direction;
                if (this._rtl)
                    this._right_to_left();
                else
                    this._left_to_right();
            }
        }

        private _left_to_right(): void {
            // Displays text from left to right on the LCD.
            this.displaymode |= _LCD_ENTRYLEFT
            this._write8(_LCD_ENTRYMODESET | this.displaymode)
        }

        private _right_to_left(): void {
            // Displays text from right to left on the LCD.
            this.displaymode &= ~_LCD_ENTRYLEFT
            this._write8(_LCD_ENTRYMODESET | this.displaymode)
        }

        /** 
         * Fill one of the first 8 CGRAM locations with custom characters.
         * The location parameter should be between 0 and 7 and pattern should
         * provide an array of 8 bytes containing the pattern. E.g. you can easily
         * design your custom character at http://www.quinapalus.com/hd44780udg.html
         * To show your custom character use, for example, ``lcd.message = ""``
*/
        public create_char(location: number, pattern: Buffer): void {
            // only position 0..7 are allowed
            location &= 0x7
            this._write8(_LCD_SETCGRAMADDR | location << 3)
            for (let i = 0; i < 8; ++i) {
                this._write8(pattern[i], true)
            }
        }


        /**
         * Sends 8b ``value`` in ``char_mode``.
         * @param value bytes
         * @param char_mode character/data mode selector. False (default) for data only, True for character bits.
         */
        private _write8(value: number, char_mode = false): void {
            __write8(value, char_mode);
            // one ms delay to prevent writing too quickly.
            pause(1)
            // set character/data bit. (charmode = False)
            this.reset.digitalWrite(char_mode)
            // WRITE upper 4 bits
            this.dl4.digitalWrite(!!(value >> 4 & 1));
            this.dl5.digitalWrite(!!(value >> 5 & 1));
            this.dl6.digitalWrite(!!(value >> 6 & 1));
            this.dl7.digitalWrite(!!(value >> 7 & 1));
            // send command
            this._pulse_enable()
            // WRITE lower 4 bits
            this.dl4.digitalWrite(!!(value & 1));
            this.dl5.digitalWrite(!!(value >> 1 & 1));
            this.dl6.digitalWrite(!!(value >> 2 & 1));
            this.dl7.digitalWrite(!!(value >> 3 & 1));
            this._pulse_enable()
        }

        private _pulse_enable(): void {
            // Pulses (lo->hi->lo) to send commands.
            this.enable.digitalWrite(false);
            control.waitMicros(1);
            this.enable.digitalWrite(true);
            control.waitMicros(1);
            this.enable.digitalWrite(false);
            control.waitMicros(1);
        }
    }
}

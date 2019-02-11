namespace lcd {

    export class CharacterLCDRGB extends CharacterLCD {
        read_write: DigitalInOutPin; /** TODO: type **/
        rgb_led: PwmOnlyPin[]; /** TODO: type **/
        _color: number;
        /** 
         * Interfaces with RGB character LCDs.
        */
        constructor(rs: DigitalInOutPin,
            en: DigitalInOutPin,
            db4: DigitalInOutPin, db5: DigitalInOutPin, db6: DigitalInOutPin, db7: DigitalInOutPin,
            columns: number, lines: number,
            red: PwmOnlyPin, green: PwmOnlyPin, blue: PwmOnlyPin,
            read_write: DigitalInOutPin = null) {
            super(rs, en, db4, db5, db6, db7, columns, lines);
            // Define read_write (rw) pin
            this.read_write = read_write;
            // Setup rw pin if used
            if (read_write)
                this.read_write.digitalWrite(false);

            // define color params
            this.rgb_led = [red, green, blue]
            for (let pin of this.rgb_led) {
                pin.digitalWrite(false);
            }
            this._color = 0;
        }

        /** 
        * The color of the display. Provide a list of three integers ranging 0 - 100, ``[R, G, B]``.
        * ``0`` is no color, or "off". ``100`` is maximum color. For example, the brightest red would
        * be ``[100, 0, 0]``, and a half-bright purple would be, ``[50, 0, 50]``.
    
        * If PWM is unavailable, ``0`` is off, and non-zero is on. For example, ``[1, 0, 0]`` would
        * be red. 
        **/
        get color(): number {
            return this._color
        }

        set color(color: number) {
            this._color = color;
            const channels = [(this._color >> 16) & 0xff, (this._color >> 8) & 0xff, (this._color) & 0xff]
            this.rgb_led.forEach((pin, i) => {
                pin.analogWrite(Math.map(channels[i], 0, 0xff, 0, 1024));
            })
        }
    }
}
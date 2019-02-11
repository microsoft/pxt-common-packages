namespace lcd {
    export class CharacterLCDMono extends CharacterLCD {
        backlight_pin: DigitalInOutPin;
        backlight_inverted: boolean;
        /** 
         * Interfaces with monochromatic character LCDs.
        @param backlight_inverted: ``False`` if LCD is not inverted, i.e. backlight pin is
            connected to common anode. ``True`` if LCD is inverted i.e. backlight pin is connected
            to common cathode.
        */
        constructor(rs: DigitalInOutPin, en: DigitalInOutPin, db4: DigitalInOutPin, db5: DigitalInOutPin,
            db6: DigitalInOutPin,
            db7: DigitalInOutPin, columns: number, lines: number,
            backlight_pin: DigitalInOutPin = null, backlight_inverted: boolean = false) {
            super(rs, en, db4, db5, db6, db7, columns, lines);
            // Backlight pin and inversion
            this.backlight_pin = backlight_pin;
            this.backlight_inverted = !!backlight_inverted;
            // Setup backlight
            if (this.backlight_pin)
                this.backlight_pin.digitalWrite(this.backlight_inverted);
        }

        /** 
         * Enable or disable backlight. True if backlight is on. False if backlight is off.
         **/
        get backlight(): boolean {
            return this._enable
        }

        set backlight(enable: boolean) {
            this._enable = enable;
            this.backlight_pin.digitalWrite(enable ? !this.backlight_inverted : this.backlight_inverted);
        }
    }
}
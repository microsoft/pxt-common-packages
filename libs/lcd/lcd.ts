namespace lcd {
    let _mono: CharacterLCD;

    function mono(): CharacterLCD {
        if (_mono) return _mono;

        const rs = pins.pinByCfg(DAL.CFG_PIN_LCD_RESET);
        const en = pins.pinByCfg(DAL.CFG_PIN_LCD_ENABLE);
        const db4 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE4);
        const db5 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE5);
        const db6 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE6);
        const db7 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE7);
        const columns = pxt.cfg(DAL.CFG_NUM_LCD_COLUMNS, 16);
        const lines = pxt.cfg(DAL.CFG_NUM_LCD_ROWS, 2);

        _mono = new CharacterLCDMono(rs, en, db4, db5, db6, db7, columns, lines);
        return _mono;
    }

    /**
     * Shows a string on the mono LCD screen
     * @param text 
     */
    export function showString(text: string) {
        const l = lcd();
        l.clear();
        l.message = text;
    }
}
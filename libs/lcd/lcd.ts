/**
 * Character LCD support
 */
//% icon="\uf0ae" color="#219E42"
namespace lcd {
    let _screen: CharacterLCD;

    function screen(): CharacterLCD {
        if (_screen !== undefined) return _screen;

        const rs = pins.pinByCfg(DAL.CFG_PIN_LCD_RESET);
        const en = pins.pinByCfg(DAL.CFG_PIN_LCD_ENABLE);
        const db4 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE4);
        const db5 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE5);
        const db6 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE6);
        const db7 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE7);
        const columns = control.getConfigValue(DAL.CFG_NUM_LCD_COLUMNS, 16);
        const lines = control.getConfigValue(DAL.CFG_NUM_LCD_ROWS, 2);

        if (!rs || !en || !db4 || !db5 || !db6 || !db7) {
            _screen = null; // not supported
        }
        else {
            _screen = new CharacterLCDMono(rs, en, db4, db5, db6, db7, columns, lines);
        }
        return _screen;
    }

    /**
     * Shows a string on the mono LCD screen
     * @param text 
     */
    //% blockId=lcdshowstring block="lcd show string %text"
    //% parts="lcd"
    export function showString(text: string) {
        const l = screen();
        if (!l) return;

        l.clear();
        l.message = text;
    }

    /**
     * Enables or disables display
     * @param enabled true to turn the display on; false otherwise
     */
    //% blockId=lcdsetdisplay block="lcd set display %enabled"
    //% enabled.shadow=toggleOnOff
    //% parts="lcd"
    export function setDisplay(enabled: boolean) {
        const l = screen();
        if (!l) return;

        l.display = !!enabled;
    }

    /**
     * Enables or disables blinking
     * @param enabled true to blink
     */
    //% blockId=lcdsetblink block="lcd set blink %enabled"
    //% enabled.shadow=toggleOnOff
    export function setBlink(enabled: boolean) {
        const l = screen();
        if (!l) return;

        l.blink = !!enabled;
    }
}
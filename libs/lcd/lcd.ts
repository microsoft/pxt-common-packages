/**
 * Character LCD support
 */
//% icon="\uf0ae" color="#219E42" blockGap=8
//% groups='["Display", "Configuration"]'
namespace lcd {
    let _screen: CharacterLCD;

    /**
     * Gets the current LCD screen
     */
    export function screen(): CharacterLCD {
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
     * Shows a string on the LCD screen
     * @param text the text to show
     * @param line the line number starting at 1...
     */
    //% blockId=lcdshowstring block="lcd show string %text at line %line"
    //% line.min=1 line.max=2 line.defl=1
    //% parts="lcd"
    //% group="Display"
    export function showString(text: string, line?: number) {
        const l = screen();
        if (!l) return;
        if (line === undefined) line = 1;

        line = (line - 1) | 0;
        if (line < 0 || line >= l.lines) return; // out of range

        // insert text in line
        const lines = (l.message || "").split('\n');
        // assign all lines within range
        text.split('\n')
            .filter((tl, i) => line + i < l.lines)
            .forEach((tl, i) => {
                lines[line + i] = tl;
            })
        // reassemble text
        const message = lines.map(l => l || "").join('\n');

        l.clear();
        l.message = message;
    }

    /**
     * Shows a number on the LCD screen
     * @param value the number to show
     */
    //% blockId=lcdshownumber block="lcd show number %value at line %line"
    //% line.min=1 line.max=2 line.defl=1
    //% parts="lcd"
    //% group="Display"
    export function showNumber(value: number, line?: number) {
        showString(value.toString(), line);
    }

    /**
     * Clears the screen
     */
    //% blockId=lcdclear block="lcd clear"
    //% parts=lcd
    //% group="Display"
    export function clear() {
        const l = screen();
        if (!l) return;
        l.clear();
        l.message = "";
    }

    /**
     * Enables or disables display
     * @param enabled true to turn the display on; false otherwise
     */
    //% blockId=lcdsetdisplay block="lcd set display %enabled"
    //% enabled.shadow=toggleOnOff
    //% parts="lcd"
    //% group="Configuration"
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
    //% group="Configuration"
    export function setBlink(enabled: boolean) {
        const l = screen();
        if (!l) return;

        l.blink = !!enabled;
    }

    /**
     * Show or hide cursor
     * @param enabled true to display cursor, false otherwise
     */
    //% blockId=lcdsetcursor block="lcd set curcor %enabled"
    //% enabled.shadow=toggleOnOff
    //% group="Configuration"
    export function setCursor(enabled: boolean) {
        const l = screen();
        if (!l) return;

        l.cursor = !!enabled;
    }
}
/**
 * Character LCD support
 */
//% icon="\uf0ae" color="#219E42" blockGap=8
//% groups='["Display", "Configuration"]'
namespace lcd {
    export let screen: CharacterLCD;

    function init(): CharacterLCD {
        if (screen !== undefined) return screen;

        const rs = pins.pinByCfg(DAL.CFG_PIN_LCD_RESET);
        const en = pins.pinByCfg(DAL.CFG_PIN_LCD_ENABLE);
        const db4 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE4);
        const db5 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE5);
        const db6 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE6);
        const db7 = pins.pinByCfg(DAL.CFG_PIN_LCD_DATALINE7);
        const columns = control.getConfigValue(DAL.CFG_NUM_LCD_COLUMNS, 16);
        const lines = control.getConfigValue(DAL.CFG_NUM_LCD_ROWS, 2);

        if (!rs || !en || !db4 || !db5 || !db6 || !db7) {
            screen = null; // not supported
        }
        else {
            screen = new CharacterLCDMono(rs, en, db4, db5, db6, db7, columns, lines);
        }
        return screen;
    }

    /**
     * Shows a string on the LCD screen
     * @param text the text to show
     */
    //% blockId=lcdshowstring block="lcd show string %text"
    //% parts="lcd"
    //% group="Display"
    export function showString(text: string) {
        const l = init();
        if (!l) return;

        l.clear();
        l.message = text;
    }

    /**
     * Shows a number on the LCD screen
     * @param value the number to show
     */
    //% blockId=lcdshownumber block="lcd show number %value"
    //% parts="lcd"
    //% group="Display"
    export function showNumber(value: number) {
        showString(value.toString());
    }

    /**
     * Clears the screen
     */
    //% blockId=lcdclear block="lcd clear"
    //% parts=lcd
    //% group="Display"
    export function clear() {
        showString("");
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
        const l = init();
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
        const l = init();
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
        const l = init();
        if (!l) return;

        l.cursor = !!enabled;
    }
}
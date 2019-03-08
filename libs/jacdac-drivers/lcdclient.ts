namespace jacdac {
    //% fixedInstances
    export class LCDClient extends ActuatorClient {
        constructor(name: string) {
            super(name, jacdac.LCD_DEVICE_CLASS, 17);
            this.setDisplay(true);
        }

        /**
         * Shows a string on the LCD screen
         * @param text the text to show
         */
        //% blockId=jdlcdshowstring block="jacdac %client show string %text"
        //% group="LCD" blockGap=8
        showString(text: string) {
            // test for change
            const n = text.length;
            let changed = false;
            for (let i = 1; i < this.state.length; ++i) {
                const c = i < n ? text.charCodeAt(i) : 0;
                changed = changed || this.state[i] != c;
                this.state[i] = c;
            }
            if (changed)
                this.notifyChange();
        }

        /**
         * Shows a number on the LCD screen
         * @param value the number to show
         */
        //% blockId=jdlcdshownumber block="jacdac %client show number %value"
        //% group="LCD" blockGap=8
        showNumber(value: number) {
            this.showString(value.toString());
        }

        /**
         * Clears the screen
         */
        //% blockId=jdlcdclear block="jacdac clear %client"
        //% group="LCD" blockGap=8
        clear() {
            this.showString("");
        }

        private setFlag(flag: JDLCDFlags, enabled: boolean) {
            if (!!(this.state[0] & flag) == enabled) return;
            if (enabled)
                this.state[0] = this.state[0] | flag;
            else
                this.state[0] = ~(~this.state[0] | flag);
            this.notifyChange();
        }

        /**
         * Enables or disables display
         * @param enabled true to turn the display on; false otherwise
         */
        //% blockId=jdlcdsetdisplay block="jacdac set %client display %enabled"
        //% enabled.shadow=toggleOnOff
        //% group="LCD" blockGap=8
        setDisplay(enabled: boolean) {
            this.setFlag(JDLCDFlags.Display, enabled);
        }

        /**
         * Enables or disables blinking
         * @param enabled true to blink
         */
        //% blockId=jdlcdsetblink block="jacdac set %client blink %enabled"
        //% enabled.shadow=toggleOnOff
        //% group="LCD" blockGap=8
        setBlink(enabled: boolean) {
            this.setFlag(JDLCDFlags.Blink, enabled);
        }

        /**
         * Show or hide cursor
         * @param enabled true to display cursor, false otherwise
         */
        //% blockId=jdlcdsetcursor block="jacdac set %client curcor %enabled"
        //% enabled.shadow=toggleOnOff
        //% group="LCD" blockGap=8
        setCursor(enabled: boolean) {
            this.setFlag(JDLCDFlags.Cursor, enabled);
        }
    }

    /**
     * A character LCD client
     */
    //% fixedInstance whenUsed block="lcd client"
    export const lcdClient = new LCDClient("lcd");
}
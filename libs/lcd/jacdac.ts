namespace jacdac {
    //% fixedInstances
    export class LCDService extends ActuatorService {
        constructor(name: string) {
            super(name, jacdac.LCD_DEVICE_CLASS, 17);
        }

        handleStateChanged() {
            const l = lcd.screen();
            if (!l) return true;

            const flags: JDLCDFlags = this.state[0];
            l.display = !!(flags & JDLCDFlags.Display);
            l.blink = !!(flags & JDLCDFlags.Blink);
            l.cursor = !!(flags & JDLCDFlags.Cursor);

            const message = bufferToString(this.state, 1);
            if (message != l.message) {
                l.clear();
                l.message = message;
            }
            return true;
        }
    }

    /**
     * A Character LCD service
     */
    //% fixedInstance whenUsed block="lcd service"
    export const lcdService = new LCDService("lcd");
}
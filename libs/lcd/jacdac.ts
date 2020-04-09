namespace jacdac {
    //% fixedInstances
    export class LCDService extends ActuatorService {
        constructor(name: string) {
            super(name, jd_class.LCD, 17);
        }

        handleStateChanged() {
            const l = lcd.screen();
            if (!l)
                return

            const flags: JDLCDFlags = this.state[0];
            l.display = !!(flags & JDLCDFlags.Display);
            l.blink = !!(flags & JDLCDFlags.Blink);
            l.cursor = !!(flags & JDLCDFlags.Cursor);

            const message = this.state.slice(1).toString();
            if (message != l.message) {
                l.message = message;
            }
        }
    }

    /**
     * A Character LCD service
     */
    //% fixedInstance whenUsed block="lcd service"
    export const lcdService = new LCDService("lcd");
}
namespace jacdac {
    //% fixedInstances
    export class LCDService extends ActuatorService {
        constructor(name: string) {
            super(name, jacdac.LCD_DEVICE_CLASS, 17);
        }

        handleStateChanged() {
            const flags: JDLCDFlags = this.state[0];

            lcd.setDisplay(!!(flags & JDLCDFlags.Display));
            lcd.setBlink(!!(flags & JDLCDFlags.Blink));
            lcd.setCursor(!!(flags & JDLCDFlags.Cursor));

            const message = bufferToString(this.state, 1);
            lcd.showString(message);
            return true;
        }
    }

    /**
     * A Character LCD service
     */
    //% fixedInstance whenUsed block="lcd service"
    export const lcdService = new LCDService("lcd");
}
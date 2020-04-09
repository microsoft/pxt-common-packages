namespace jacdac {
    //% fixedInstances
    export class TouchButtonClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("touch", jd_class.TOUCHBUTTON, requiredDevice);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacadactouchispressed block="jacdac %button value"
        //% group="Touch"
        value(): number {
            const s = this.state;
            if (!s || s.length < 2) return -1;
            return s.getNumber(NumberFormat.UInt16LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadactouchonevent block="jacdac %button on %event"
        //% group="Touch"
        onEvent(event: JDButtonEvent, handler: () => void) {
            this.registerEvent(event, handler);
        }
    }

    //% fixedInstance whenUsed block="touch button client"
    export const touchButtonClient = new TouchButtonClient("touch");

    /**
     * A client of multiple buttons
     */
    export class TouchButtonsClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("mtouch", jd_class.TOUCH_BUTTONS, requiredDevice);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jdtoubhbuttonsvalue block="jacdac %button value"
        //% group="Touch"
        value(index: number): number {
            const s = this.state;
            if (!s || s.length + 1 < 2 * index) return -1;
            return s.getNumber(NumberFormat.UInt16LE, index * 2);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jdtouchbuttonsevent block="jacdac %client %index on %event"
        //% group="Touch"
        onEvent(index: number, event: JDButtonEvent, handler: () => void) {
            const j = jacdac.BUTTON_EVENTS.indexOf(<number>event);
            if (j > -1) {
                const k = DAL.ACCELEROMETER_EVT_SHAKE + 1
                    + index * jacdac.BUTTON_EVENTS.length + j;
                this.registerEvent(k, handler);
            }
        }
    }

    //% fixedInstance whenUsed block="touch buttons client"
    export const touchButtonsClient = new TouchButtonsClient();
}
namespace jacdac {
    //% fixedInstances
    export class SwitchClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("switch", jd_class.SWITCH, requiredDevice);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacdacswitchright block="jacdac %switch right"
        //% group="Switch"
        right(): boolean {
            const s = this.state;
            if (!s || s.length < 1) return false;
            return !!s.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacdacswitchonevent block="jacdac %switch on %event"
        //% group="Switch"
        onEvent(event: JDSwitchDirection, handler: () => void) {
            this.registerEvent(event, handler);
        }
    }

    //% fixedInstance whenUsed block="switch client"
    export const switchClient = new SwitchClient();
}
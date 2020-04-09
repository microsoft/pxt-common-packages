namespace jacdac {
    //% fixedInstances
    export class ButtonClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("btn", jd_class.BUTTON, requiredDevice);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacadacbtispressed block="jacdac %button is pressed"
        //% group="Buttons"
        isPressed(): boolean {
            const s = this.state;
            if (!s || s.length < 1) return false;
            return !!s.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadacbtnonevent block="jacdac %button on %event"
        //% group="Buttons"
        onEvent(event: JDButtonEvent, handler: () => void) {
            this.registerEvent(event, handler);
        }
    }

    //% fixedInstance whenUsed block="button client"
    export const buttonClient = new ButtonClient();

}
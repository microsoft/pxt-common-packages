namespace jacdac {
    //% fixedInstances
    export class TouchButtonVirtualDriver extends SensorVirtualDriver {
        constructor(name: string) {
            super(name, jacdac.TOUCHBUTTON_DRIVER_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        //% blockId=jacadactouchispressed block="jacdac %button value"
        //% group="Input"
        value(): number {
            const s = this.state;
            if (!s || s.length < 2) return 0;
            return s.getNumber(NumberFormat.UInt16LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadacbtnonevent block="jacdac %button on %event"
        //% group="Input"
        onEvent(event: ButtonEvent, handler: () => void) {
            control.onEvent(this.id, event, handler);
        }
    }

    //% fixedInstance whenUsed
    export const touch = new TouchButtonVirtualDriver("touch");
}
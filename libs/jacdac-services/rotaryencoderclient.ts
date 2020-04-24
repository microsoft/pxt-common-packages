namespace jacdac {
    //% fixedInstances
    export class RotaryEncoderClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("crank", jd_class.ROTARY_ENCODER, requiredDevice);
        }

        /**
         * Gets the position of the rotary encoder
         */
        //% blockId=jacdacrotaryencoderposition block="jacdac %encoder position"
        //% group="Rotary Encoder"
        get position(): number {
            const st = this.state;
            if (!st || st.length < 4) return 0;
            return st.getNumber(NumberFormat.Int32LE, 0);
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadacrotaryencoderonevent block="jacdac %client on %event"
        //% group="Light sensor"
        onEvent(event: JDRotaryEncoderEvent, handler: () => void) {
            this.registerEvent(event, handler);
        }
    }

    /**
     * Default rotary encoder
     */
    //% fixedInstance block="rotary encoder client"
    export const rotaryEncoderClient = new RotaryEncoderClient();
}
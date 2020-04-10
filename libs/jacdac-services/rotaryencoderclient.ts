namespace jacdac {
    //% fixedInstances
    export class RotaryEncoderClient extends SensorClient {
        constructor(requiredDevice: string = null) {
            super("crank", jd_class.ROTARY_ENCODER, requiredDevice);
        }

        scale = 1
        private _min: number
        private _max: number
        private _offset: number

        /**
         * Always clamp the encoder position to given range.
         */
        setRange(min: number, max: number) {
            this._min = min
            this._max = max
            this._offset = 0
        }

        /**
         * Gets the position of the rotary encoder
         */
        //% blockId=jacdacrotaryencoderposition block="jacdac %encoder position"
        //% group="Rotary Encoder"
        get position(): number {
            const st = this.state;
            if (!st || st.length < 4) return 0;

            const curr = st.getNumber(NumberFormat.Int32LE, 0) * this.scale
            if (this._offset != null) {
                const p = curr + this._offset
                if (p < this._min)
                    this._offset = this._min - curr
                else if (p > this._max)
                    this._offset = this._max - curr
                return curr + this._offset
            } else {
                return curr
            }
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
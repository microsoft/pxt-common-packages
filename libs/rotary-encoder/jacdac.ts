namespace jacdac {
    const ROT_EV_CHANGED = 0x2233;
    //% fixedInstances
    export class RotaryEncoderHost extends SensorHost {
        encoder: RotaryEncoder;
        constructor(encoder: RotaryEncoder) {
            super("crank", jacdac.ROTARY_ENCODER_DEVICE_CLASS);
            this.encoder = encoder;
            this.encoder.onChanged(() => this.raiseHostEvent(JDRotaryEncoderEvent.Changed))
        }

        serializeState(): Buffer {
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.Int32LE, 0, this.encoder.position());
            return buf;
        }
    }

    /**
     * A rotary encoder JACDAC host
     */
    //% whenUsed fixedInstance block="rotary encoder host"
    export const rotaryEncoder = new RotaryEncoderHost(encoders.defaultEncoder);
}
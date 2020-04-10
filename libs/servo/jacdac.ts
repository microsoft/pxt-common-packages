namespace jacdac {
    export class ServoService extends ActuatorService {
        servo: servos.Servo;
        constructor(name: string, servo: servos.Servo) {
            super(name, jd_class.SERVO, 2);
            this.servo = servo;
        }

        protected handleStateChanged() {
            if (!this.intensity)
                this.servo.stop();
            else {
                const pulse = this.state.unpack("h")[0]
                this.servo.setPulse(pulse);
            }
        }
    }

    // use multiple instances of ServoService if more than one servo is required
}
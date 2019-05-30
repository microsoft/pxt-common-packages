namespace jacdac {
    export class ServoService extends ActuatorService {
        servo: servos.Servo;
        constructor(name: string, servo: servos.Servo) {
            super(name, jacdac.SERVO_DEVICE_CLASS, 8, 2);
            this.servo = servo;
        }

        addAdvertisementData() {
            this.controlData.setNumber(NumberFormat.Int16LE, 0, this.servo.angle);
            return super.addAdvertisementData();
        }

        protected handleStateChanged(): number {
            const on = !!this.state[0];
            if (!on)
                this.servo.stop();
            else {
                const angle = this.state.getNumber(NumberFormat.Int16LE, 1);
                const pulse = this.state.getNumber(NumberFormat.Int16LE, 3);
                if (pulse)
                    this.servo.setPulse(pulse);
                this.servo.setAngle(angle);
            }
            return jacdac.DEVICE_OK;
        }
    }

    export class ServosService extends ActuatorService {
        private servos: servos.Servo[];

        constructor(name: string, servos: servos.Servo[]) {
            super(name, jacdac.SERVOS_DEVICE_CLASS, servos.length * 4, servos.length * 2);
            this.servos = servos;
        }

        addAdvertisementData() {
            for (let i = 0; i < this.servos.length; ++i) {
                this.controlData.setNumber(NumberFormat.Int16LE, i * 2, this.servos[i].angle);
            }
            return super.addAdvertisementData();
        }

        protected handleStateChanged(): number {
            for (let i = 0; i < this.servos.length && (i + 1) * 4 <= this.state.length; ++i) {
                const servo = this.servos[i];
                const on = !!this.state.getNumber(NumberFormat.UInt8LE, i * 4);
                const angle = this.state.getNumber(NumberFormat.Int16LE, i * 4 + 1);
                if (!on)
                    servo.stop();
                else
                    servo.setAngle(angle);
            }
            return jacdac.DEVICE_OK;
        }
    }
}
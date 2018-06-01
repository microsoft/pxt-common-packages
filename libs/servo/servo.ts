namespace motors {
    //% fixedInstances
    export class Servo {
        constructor() {
        }

        /**
         * set the servo angle
         */
        //% group="Servos"
        //% weight=100
        //% blockId=sawservosetangle block="set %servo angle to %degrees °"
        //% degrees.min=0 degrees.max=180
        //% degrees.defl=90
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% blockGap=8
        setAngle(degrees: number) {
            degrees = degrees | 0;
            degrees = Math.clamp(0, 180, degrees);
            this.internalSetAngle(degrees);
        }

        protected internalSetAngle(angle: number): void {

        }

        /**
         * Set the throttle on a continuous servo
         * @param speed the throttle of the motor from -100% to 100%
         */
        //% group="Servos"
        //% weight=99
        //% blockId=sawservorun block="continuous %servo run at %speed=speedPicker \\%"
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        run(speed: number): void {
            this.setAngle(Math.map(speed, -100, 100, 0, 180));
        }        

        /*
         * set the pulse width to the servo in microseconds
         */
        //% group="Servos"
        //% weight=10
        //% blockId=sawservosetpulse block="set %servo pulse to %micros μs"
        //% micros.min=500 micros.max=2500
        //% micros.defl=1500
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        setPulse(micros: number) {
            micros = micros | 0;
            micros = Math.clamp(500, 2500, micros);
            this.internalSetPulse(micros);
         }

         protected internalSetPulse(micros: number): void {

         }
    }

    export class PinServo extends Servo {
        private _pin: PwmOnlyPin;

        constructor(pin: PwmOnlyPin) {
            super();
            this._pin = pin;
        }

        protected internalSetAngle(angle: number): void {
            this._pin.servoWrite(angle);
        }
        
        protected internalSetPulse(micros: number): void {
            this._pin.servoSetPulse(micros);
        }
    }
}
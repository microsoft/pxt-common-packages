/**
 * Control micro servos
 */
//% color="#03AA74" weight=88 icon="\uf021" blockGap=8
//% groups='["Positional", "Continuous", "Configuration"]'
namespace servos {
    //% fixedInstances
    export class Servo {
        private _minAngle: number;
        private _maxAngle: number;
        private _stopOnNeutral: boolean;

        constructor() {
            this._minAngle = 0;
            this._maxAngle = 180;
            this._stopOnNeutral = false;
        }

        private clampDegrees(degrees: number): number {
            degrees = degrees | 0;
            degrees = Math.clamp(this._minAngle, this._maxAngle, degrees);
            return degrees;
        }

        /**
         * Set the servo angle
         */
        //% weight=100 help=servos/set-angle
        //% blockId=servoservosetangle block="set %servo angle to %degrees=protractorPicker °"
        //% degrees.defl=90
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% blockGap=8
        //% parts=microservo trackArgs=0
        //% group="Positional"
        setAngle(degrees: number) {
            degrees = this.clampDegrees(degrees);
            this.internalSetAngle(degrees);
        }

        protected internalSetAngle(angle: number): void {

        }

        /**
         * Set the throttle on a continuous servo
         * @param speed the throttle of the motor from -100% to 100%
         */
        //% weight=99 help=servos/run
        //% blockId=servoservorun block="continuous %servo run at %speed=speedPicker \\%"
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% parts=microservo trackArgs=0
        //% group="Continuous"
        //% blockGap=8
        run(speed: number): void {
            const degrees = this.clampDegrees(Math.map(speed, -100, 100, this._minAngle, this._maxAngle));
            const neutral = (this.maxAngle - this.minAngle) >> 1;
            if (this._stopOnNeutral && degrees == neutral)
                this.stop();
            else
                this.setAngle(degrees);
        }

        /**
         * Set the pulse width to the servo in microseconds
         * @param micros the width of the pulse in microseconds
         */

        //% weight=10 help=servos/set-pulse
        //% blockId=servoservosetpulse block="set %servo pulse to %micros μs"
        //% micros.min=500 micros.max=2500
        //% micros.defl=1500
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% parts=microservo trackArgs=0
        //% group="Configuration"
        //% blockGap=8
        setPulse(micros: number) {
            micros = micros | 0;
            micros = Math.clamp(500, 2500, micros);
            this.internalSetPulse(micros);
        }

        protected internalSetPulse(micros: number): void {

        }

        /**
         * Stop sending commands to the servo so that its rotation will stop at the current position.
         */
        // On a normal servo this will stop the servo where it is, rather than return it to neutral position.
        // It will also not provide any holding force.
        //% weight=10 help=servos/stop
        //% blockId=servoservostop block="stop %servo"
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% parts=microservo trackArgs=0
        //% group="Continuous"
        //% blockGap=8
        stop() {
            this.internalStop();
        }

        /**
         * Gets the minimum angle for the servo
         */
        public get minAngle() {
            return this._minAngle;
        }

        /**
         * Gets the maximum angle for the servo
         */
        public get maxAngle() {
            return this._maxAngle;
        }

        /**
         * Set the possible rotation range angles for the servo between 0 and 180
         * @param minAngle the minimum angle from 0 to 90
         * @param maxAngle the maximum angle from 90 to 180
         */
        //% help=servos/set-range
        //% blockId=servosetrange block="set %servo range from %minAngle to %maxAngle"
        //% minAngle.min=0 minAngle.max=90
        //% maxAngle.min=90 maxAngle.max=180 maxAngle.defl=180
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% parts=microservo trackArgs=0
        //% group="Configuration"
        //% blockGap=8
        public setRange(minAngle: number, maxAngle: number) {
            this._minAngle = Math.max(0, Math.min(90, minAngle | 0));
            this._maxAngle = Math.max(90, Math.min(180, maxAngle | 0));
        }

        /**
         * Set a servo stop mode so it will stop when the rotation angle is in the neutral position, 90 degrees.
         * @param on true to enable this mode
         */
        //% help=servos/set-stop-on-neutral
        //% blockId=servostoponneutral block="set %servo stop on neutral %on"
        //% on.fieldEditor=toggleonoff
        //% on.fieldOptions.decompileLiterals=true
        //% group="Configuration"
        //% blockGap=8
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        public setStopOnNeutral(on: boolean) {
            this._stopOnNeutral = on;
        }

        protected internalStop() { }
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

        protected internalStop() {
            this._pin.digitalWrite(false);
        }
    }
}

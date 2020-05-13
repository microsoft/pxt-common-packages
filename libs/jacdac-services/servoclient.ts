namespace jacdac {
    //% fixedInstances
    export class ServoClient extends Client {
        constructor(requiredDevice: string = null) {
            super("servo", jd_class.SERVO, requiredDevice);
        }

        private pulse: number
        private autoOff: number
        private lastSet: number

        private sync(n: number) {
            this.lastSet = control.millis()
            if (n === this.pulse)
                return
            if (n == null) {
                this.setRegInt(REG_INTENSITY, 0)
            } else {
                this.setRegInt(REG_VALUE, n | 0)
                this.setRegInt(REG_INTENSITY, 1)
            }
            this.pulse = n
        }

        setAutoOff(ms: number) {
            if (!ms) ms = 0
            this.lastSet = control.millis()
            if (this.autoOff === undefined)
                jacdac.onAnnounce(() => {
                    if (this.pulse != null && this.autoOff && control.millis() - this.lastSet > this.autoOff) {
                        this.turnOff()
                    }
                })

            this.autoOff = ms
        }

        turnOff() {
            this.sync(undefined)
        }

        /**
         * Set the servo angle
         */
        //% group="Servos"
        //% weight=100
        //% blockId=jdservoservosetangle block="jacdac set %servo angle to %degrees=protractorPicker °"
        //% degrees.defl=90
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% blockGap=8        
        setAngle(degrees: number) {
            // this isn't exactly what the internets say, but it's what codal does
            const center = 1500
            const range = 2000
            const lower = center - (range >> 1) << 10;
            const scaled = lower + (range * Math.idiv(degrees << 10, 180));
            this.setPulse(scaled >> 10)
        }

        /**
         * Set the throttle on a continuous servo
         * @param speed the throttle of the motor from -100% to 100%
         */
        //% group="Servos"
        //% weight=99
        //% blockId=jdservoservorun block="jacdac continuous %servo run at %speed=speedPicker \\%"
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        run(speed: number): void {
            this.setAngle(Math.map(speed, -100, 100, 0, 180));
        }

        /*
         * Set the pulse width to the servo in microseconds
         */
        //% group="Servos"
        //% weight=10 help=servos/set-pulse
        //% blockId=jdservoservosetpulse block="jacdac set %servo pulse to %micros μs"
        //% micros.min=500 micros.max=2500
        //% micros.defl=1500
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% parts=microservo trackArgs=0
        setPulse(micros: number) {
            micros = micros | 0;
            micros = Math.clamp(500, 2500, micros);
            this.sync(micros)
        }
    }

    //% fixedInstance whenUsed block="servo client"
    export const servoClient = new ServoClient();
}
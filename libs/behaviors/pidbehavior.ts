namespace behaviors {
    /**
     * A PID controller
     */
    export class PIDBehavior extends Behavior {
        private error: () => number;
        private output: (value: number) => void;
        // proportional constant
        public Kp: number;
        // integral constant
        public Ki: number;
        // derivative constant
        public Kd: number;
        // time step between control times
        public sampleTime: number;

        constructor(error: () => number, output: (value: number) => void, kp: number, ki: number, kd: number) {
            super();
            this.error = error;
            this.output = output;
            this.Kp = kp;
            this.Ki = ki;
            this.Kd = kd;
            this.sampleTime = 20;
        }

        shouldRun(): boolean {
            return true;
        }

        run() {
            let then = control.millis();
            let thenErr = 0;
            let integral = 0;

            while (this.active) {
                // and wait
                loops.pause(this.sampleTime);
                // compute current state
                let now = control.millis();
                const dt = now - then; // ms
                const err = this.error();

                // compute PID
                const proportional = this.Kp * err;
                integral += this.Ki * dt * err;
                const derivative = this.Kd * (err - thenErr) / dt;

                const r = proportional + integral + derivative;
                this.output(r);

                // save state
                then = now;
                thenErr = err;
            }
        }
    }

    /**
     * Create a PID controller for 
     * @param error a function that computes the error
     * @param output a function that receives the output
     * @param kp the proportional parameter
     * @param ki the integral parameter
     * @param kd the derivative parameter
     */
    //%
    export function pidBehavior(
        error: () => number, output: (value: number) => void, kp: number, ki: number, kd: number): PIDBehavior {
        return new PIDBehavior(error, output, kp, ki, kd);
    }
}
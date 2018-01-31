namespace automation {

    /**
     * A PID controller.
     * 
     * Reference: Feedback System, Karl Johan Astrom & Rickard M. Murry
     */
    //% fixedInstances
    export class PIDController {
        // proportional gain
        public kp: number;
        // integral gain
        public ki: number;
        // derivative gain
        public kd: number;
        // anti windup recovery, 0..1
        public kt: number;
        // derivative gain limit
        public N: number;
        // proportional set point weight        
        public b: number;
        // set point
        public ysp: number;
        // current state value
        public y: number;
        // current control value
        public u: number;
        // minimum control value
        public ulow: number;
        // maximum control value
        public uhigh: number;

        // assign this value to log internal data
        public log: (name: string, value: number) => void;

        private I: number;
        private D: number;

        constructor() {
            this.kp = 1;
            this.ki = 0;
            this.kd = 0;
            this.kt = 0.5;
            this.b = 1;
            this.ulow = 0;
            this.uhigh = 0;
            this.N = 2;
            this.ysp = 0;
            this.y = 0;
            this.u = 0;
            this.reset();
        }

        reset() {
            this.I = 0;
            this.D = 0;
        }

        /**
         * Sets the PID gains
         * @param kp proportional gain
         * @param ki integral gain
         * @param kd derivative gain
         * @param b setpoint weight, eg: 0.9
         */
        //% blockId=pidSetGains block="set %pid|gains kp %kp|ki %ki|kd %kd"
        //% group=PID
        //% inlineInputMode=inline
        //% weight=99
        setGains(kp: number, ki: number, kd: number, b: number = 1) {
            kp = Math.max(0, kp);
            ki = Math.max(0, ki);
            kd = Math.max(0, kd);
            b = Math.clamp(0, 1, b);

            // Bumpless parameter changes
            this.I += this.kp * (this.b * this.ysp - this.y) - kp * (b * this.ysp - this.y);

            // update variables
            this.kp = kp;
            this.ki = ki;
            this.kd = kd;
            this.b = b;
        }

        /**
         * Sets the control saturation values
         * @param low lowest control value, eg: -100
         * @param high highest control value, eg: 100
         */
        //% blockId=pidSetSaturation block="set %pid|control saturation from %low|to %high"        
        setControlSaturation(low: number, high: number) {
            this.ulow = low;
            this.uhigh = high;
        }

        /**
         * Sets the derivative filter gain
         * @param N the filter gain, eg:10
         */
        //% blockId=pidSetDerivativeFilter block="set %pid|derivative filter %N"
        //% N.min=2 N.max=20
        //% group=PID
        setDerivativeFilter(N: number) {
            this.N = Math.clamp(2, 20, N);
        }

        /**
         * Updates the desired setpoint
         * @param ysp 
         */
        //% blockId=pidSetPoint block="set %pid|point to %ysp"
        setPoint(ysp: number) {
            this.ysp = ysp;
        }

        /**
         * Computes the output based on the system state
         */
        //% blockId=pidCompute block="%pid|compute for timestep %timestep|(ms) at state %y"
        //% group=PID
        //% weight=100
        compute(timestep: number, y: number): number {
            const h = timestep / 1000.0;
            const K = this.kp;
            const e = this.ysp - y;

            if (this.log) {
                this.log("y", y);
                this.log("e", e);
            }

            // compute proportional part
            const P = K * (this.b * this.ysp - y);
            if (this.log) this.log("P", P);

            // update derivative part if any
            if (this.kd) {
                const Td = this.kd / K;
                const ad = (2 * Td - this.N * h) / (2 * Td + this.N * h);
                const bd = 2 * K * this.N * Td / (2 * Td + this.N * h);
                this.D = ad * this.D - bd * (y - this.y);
                if (this.log) this.log("D", this.D);
            }

            // compute temporary output
            const v = P + this.I + this.D;
            if (this.log) this.log("v", v);

            // actuator saturation
            const u = this.ulow < this.uhigh ? Math.clamp(this.ulow, this.uhigh, v) : v;
            if (this.log) this.log("u", u);

            // anti-windup
            if (this.ki) {
                const Ti = K / this.ki;
                const Tt = this.kt * h / Ti;
                const bi = this.ki * h;
                const br = h / Tt;
                this.I += bi * (this.ysp - y) + br * (u - v);
                if (this.log) this.log("I", this.I);
            }

            // update old process output
            this.y = y;
            this.u = u;

            // send output to acturator
            return this.u;
        }
    }

    //% fixedInstance
    export const pid1 = new PIDController();

    //% fixedInstance
    export const pid2 = new PIDController();

    //% fixedInstance
    export const pid3 = new PIDController();

    //% fixedInstance
    export const pid4 = new PIDController();
}
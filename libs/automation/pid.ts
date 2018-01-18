namespace automation {

    //% fixedInstances
    export class PIDController {
        // proportional gain
        public kp: number;
        // integral gain
        public ki: number;
        // derivative gain
        public kd: number;
        // derivative gain limit
        public N: number;
        // proportional set point weight        
        public b: number;
        // set point
        public ysp: number;
        // current state value
        public y: number;

        // minimum control value
        public ulow: number;
        // maximum control value
        public uhigh: number;

        private I: number;
        private D: number;

        constructor() {
            this.kp = 1;
            this.ki = 0;
            this.kd = 0;
            this.ysp = 0;
            this.y = 0;
            this.b = 0.9;
            this.ulow = -100;
            this.uhigh = 100;
            this.N = 10;
            this.reset();
        }

        reset() {
            this.I = this.D = 0;
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
        setGains(kp: number, ki: number, kd: number, b: number = 0.9) {
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
        //% N.min=5 N.max=20
        //% group=PID
        setDerivativeFilter(N: number) {
            this.N = Math.clamp(5, 20, N);
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
        //% blockId=pidCompute block="%pid|compute for timestep %timestep|(s) at state %y"
        //% group=PID
        //% weight=100
        compute(timestep: number, y: number): number {
            // https://www.cds.caltech.edu/~murray/courses/cds101/fa02/caltech/astrom-ch6.pdf
            const h = timestep;
            const K = this.kp;
            const Td = this.kd / K;
            const Tt = this.ki == 0 ? 1 << 31 : Math.sqrt(this.kd / this.ki);

            // integral gain
            const bi = this.ki * h; // k * h / Ti
            //derivative gain
            const ad = (2 * Td - this.N * h) / (2 * Td + this.N * h);
            const bd = 2 * K * this.N * Td / (2 * Td + this.N * h);
            const ao = h / Tt;

            // compute proportional part
            const P = K * (this.b * this.ysp - y);

            // update derivative part
            this.D = ad * this.D - bd * (y - this.y);

            // compute temporary output
            const v = P + this.I + this.D;

            // simulate actuator saturation
            const u = this.ulow < this.uhigh ? Math.clamp(this.ulow, this.uhigh, v) : v;

            // anti-windup update integral
            this.I += bi * (this.ysp - y) + ao * (u - v);

            // update old process output
            this.y = y;

            // send output to acturator
            return u;
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
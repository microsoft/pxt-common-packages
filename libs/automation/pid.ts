namespace automation {

    //% fixedInstances
    export class PIDController {
        // gain
        public K: number;
        // integral time
        public Ti: number;
        // derivative time
        public Td: number;
        // tracking time constant
        public Tt: number;
        // deriviate gain limit
        public N: number;
        // proportional set point weight        
        public b: number;
        // minimum control value
        public ulow: number;
        // maximum control value
        public uhigh: number;
        // set point
        public ysp: number;
        // current state value
        public y: number;

        private I: number;
        private D: number;

        constructor() {
            this.K = 0;
            this.ysp = 0;
            this.y = 0;
            this.b = 0.2;
            this.ulow = -100;
            this.uhigh = 100;
            this.N = 10;
            this.setGains(1, 0.01, 0.1, 0.2);
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
         * @param b setpoint weight
         */
        //% blockId=pidSetGains block="set %pid|gains kp %kp|ki %ki|kd %kd|b %b"
        //% group=PID
        //% inlineInputMode=inline
        //% weight=99
        setGains(kp: number, ki: number, kd: number, b: number) {
            const K = kp;
            const Ti = K / ki;
            const Td = kd / K;
            const Tt = Math.sqrt(Ti * Td);

            // Bumpless parameter changes
            this.I += this.K * (this.b * this.ysp - this.y) - K * (b * this.ysp - this.y);
            this.K = K;
            this.Ti = Ti;
            this.Td = Td;
            this.Tt = Tt;
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
        //% blockId=pidCompute block="%pid|compute for timestep %h|state %y"
        //% group=PID
        //% weight=100
        compute(h: number, y: number): number {
            // https://www.cds.caltech.edu/~murray/courses/cds101/fa02/caltech/astrom-ch6.pdf

            // integral gain
            const bi = this.K * h / this.Ti;
            const ad = (2 * this.Td - this.N * h) / (2 * this.Td + this.N * h);
            //derivative gain
            const bd = 2 * this.K * this.N * this.Td / (2 * this.Td + this.N * h);
            const ao = h / this.Tt;

            // compute proportional part
            const P = this.K * (this.b * this.ysp - y);

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
namespace automation {
    /**
     * A moving average filter
     */
    //% fixedInstances
    export class MovingAverageFilter {
        private length: number;
        private values: number[];
        private insertion: number;
        private sum: number;

        constructor() {
            this.setLength(5);
        }

        /**
         * Sets the number of samples in the filter
         * @param length number of samples in the moving average filter
         */
        //% blockId=automationMASetLength block="set %filter|length to %length"
        //% group="Filters" blockGap=8
        setLength(length: number) {
            this.length = length >> 0;
            this.values = undefined;
            this.insertion = 0;
            this.sum = 0;
        }

        /**
         * Adds a new value to the filter and computes the filtered value
         * @param newValue 
         */
        //% blockId=automationMAFilter block="%filter|filter %newValue"
        //% group="Filters" blockGap=8
        filter(newValue: number): number {
            // no filtering!
            if (this.length <= 1) return newValue;

            // initialize data with the current new value
            if (!this.values) {
                for(let i = 0; i < this.length; ++i) {
                    this.values[i] = newValue;                    
                }
                this.sum = newValue * this.length;
            }
            // remove previous value
            const oldValue = this.values[this.insertion];
            // swap a value in place
            this.values[this.insertion] = newValue;
            // update sum
            this.sum += newValue - oldValue;
            // update index
            this.insertion = (this.insertion + 1) % this.length;
            // compute average
            return this.sum / this.length;
        }
    }

    //% fixedInstance block="moving average filter 1"
    export const movingAverageFilter1 = new MovingAverageFilter();
    //% fixedInstance block="moving average filter 2"
    export const movingAverageFilter2 = new MovingAverageFilter();
    //% fixedInstance block="moving average filter 3"
    export const movingAverageFilter3 = new MovingAverageFilter();
    //% fixedInstance block="moving average filter 4"
    export const movingAverageFilter4 = new MovingAverageFilter();
}
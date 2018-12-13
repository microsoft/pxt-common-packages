namespace Math {
    /**
     * Returns a random boolean that is true the given percentage of the time.
     * @param percentage The percentage chance that the returned value will be true from 0 - 100
     */
    //% weight=2
    //% blockId=percentchance block="%percentage|\\% chance"
    //% percentage.min=0 percentage.max=100;
    export function percentChance(percentage: number): boolean {
        if (percentage >= 100) {
            return true;
        }
        else if (percentage <= 0) {
            return false;
        }
        return Math.randomRange(0, 99) < percentage;
    }

    /**
     * Returns a random element from the given list
     * @param list The list to choose an element from
     */
    //% weight=1
    //% blockId=pickrandomarray block="random item from %list=variables_get"
    export function pickRandom<T>(list: T[]) {
        if (!list || list.length == 0) {
            return undefined;
        }
        return list[Math.randomRange(0, list.length - 1)];
    }

    /**
     * Fast, 16 bit, seedable (pseudo) random generator.
     */
    export class FastRandom {
        // Implementation of the Galois Linear Feedback Shift Register
        private lfsr: number;
        // A value between 0x0001 and 0xFFFF to generate random values from
        public seed: number;

        /**
         * Create a new Fast Random generator
         * @param seed [Optional] initial seed between 0x0001 and 0xFFFF.
         */
        constructor(seed?: number) {
            if (seed === undefined) seed = Math.randomRange(0x0001, 0xFFFF);
            this.seed = seed;
            this.lfsr = seed;
        }

        /**
         * @returns the next random number between 0x0001 and 0xFFFF inclusive
         */
        next(): number {
            return this.lfsr = (this.lfsr >> 1) ^ ((-(this.lfsr & 1)) & 0xb400);
        }

        /**
         * @param min the minimum value to generate
         * @param max the maximum value to generate
         * @returns a random value between min and max (inclusive). If min is greater than or equal to max, returns min.
         */
        randomRange(min: number, max: number): number {
            return min + (max > min ? this.next() % (max - min) : 0);
        }

        /**
         * Returns a random element from the given list
         * @param list The list to choose an element from
         */
        pickRandom<T>(list: T[]) {
            if (!list || list.length == 0) {
                return undefined;
            }
            return list[this.randomRange(0, list.length - 1)];
        }

        /**
         * @returns a random boolean value
         */
        randomBool(): boolean {
            return !(this.next() & 1);
        }

        /**
         * @param percent the percentage chance that the returned value will be true from 0 - 100
         * @returns a boolean with approximately the given percent chance to be true or false
         */
        percentChance(percent: number): boolean {
            return this.randomRange(0, 100) < percent;
        }

        /**
         * Reset the state to the current seed
         */
        reset() {
            this.lfsr = this.seed;
        }
    }
}

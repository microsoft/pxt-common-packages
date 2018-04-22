namespace Math {
    /**
     * Returns a random boolean that is true the given percentage of the time.
     * @param percentage The percentage chance that the returned value will be true from 0 - 100
     */
    //% weight=1
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
}
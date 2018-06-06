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
}
/**
 * Power and sleep management
 */
//% advanced=true icon="\uf011" color="#898989"
//% weight=1 blockGap=8
namespace power {
    let _poked: number;
    let _timeout: number;

    /**
     * Sets the no-activity duration after which the device should go to deep sleep.
     * @param seconds duration in seconds until the device should be put in lower power mode
     */
    //% blockId=powersetdeepsleeptimout block="power set deep sleep timeout to %seconds s"
    //% seconds.defl=60
    export function setDeepSleepTimeout(seconds: number) {
        _timeout = seconds * 1000;
    }

    /**
     * Poke the activity watcher to keep the device awake.
     */
    //% blockId=powerpke block="power poke"
    export function poke() {
        _poked = control.millis();
    }

    /**
     * Checks if the device has had any "pokes" and needs to be put in deep sleep mode.
     */
    //% blockId=powercheckdeepsleep block="power check deep sleep"
    export function checkDeepSleep() {
        const p = _poked || 0;
        const to = _timeout || 0;
        if (to > 0 && 
            control.millis() - p > to) {
            // going to deep sleep
            deepSleep();
        }
    }

    /**
     * Puts the device into a deep sleep state.
     */
    //% blockId=powerdeepsleep block="power deep sleep"
    //% shim=pxt::deepSleep
    export function deepSleep() {
    }
}

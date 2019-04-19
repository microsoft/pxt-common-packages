/**
 * Calls a function with a fixed time delay between each call to that function.
 * @param func 
 * @param delay 
 */
//%
function setInterval(func: () => void, delay: number): number {
    delay = Math.max(10, delay | 0);
    return control.setInterval(func, delay, control.IntervalMode.Interval);
}

/**
 * Cancels repeated action which was set up using setInterval().
 * @param intervalId 
 */
//%
function clearInterval(intervalId: number) {
    control.clearInterval(intervalId, control.IntervalMode.Interval);
}

/**
 * Calls a function after specified delay.
 * @param func 
 * @param delay 
 */
//%
function setTimeout(func: () => void, delay: number): number {
    return control.setInterval(func, delay, control.IntervalMode.Timeout);
}

/**
 * Clears the delay set by setTimeout().
 * @param intervalId 
 */
//%
function clearTimeout(intervalId: number) {
    control.clearInterval(intervalId, control.IntervalMode.Timeout);
}

/**
 * Calls a function as soon as possible.
 * @param func 
 */
//%
function setImmediate(func: () => void): number {
    return control.setInterval(func, 0, control.IntervalMode.Immediate);
}

/**
 * Cancels the immediate actions.
 * @param intervalId 
 */
//%
function clearImmediate(intervalId: number) {
    control.clearInterval(intervalId, control.IntervalMode.Immediate);
}

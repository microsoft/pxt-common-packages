namespace loops {
    /**
     * Busy wait for a condition to be true
     * @param condition condition to test for
     * @param timeOut if positive, maximum duration to wait for in milliseconds
     */
    //% 
    // add block when PXT supports this signature
    export function waitUntil(condition: () => boolean, timeOut?: number): void {
        if (!condition || condition()) return; // optimistic path

        const eid = control.allocateNotifyEvent();
        const start = control.millis();
        control.runInBackground(() => {
            while (!condition() || (timeOut > 0 && control.millis() - start > timeOut)) {
                loops.pause(50);
            }
            control.raiseEvent(eid, 1);
        })
        control.waitForEvent(eid, 1);
    }

    /**
     * Runs code when the condition becomes true
     * @param condition condition to test
     * @param handler code to run
     */
    //%
    export function when(condition: () => boolean, handler: () => void) {
        if (!condition) return;

        const eid = control.allocateNotifyEvent();
        control.onEvent(eid, 1, handler);
        let old = false;
        control.runInBackground(() => {
            while (true) {
                let current = condition();
                if (current && current != old) {
                    control.raiseEvent(eid, 1);
                }
                old = current;
                loops.pause(50);
            }
        })
    }
}
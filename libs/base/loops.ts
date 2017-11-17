namespace loops {
    interface PollEvent {
        eid: number;
        vid: number;
        start: number;
        timeOut: number;
        condition: () => boolean;
        once: boolean;
    }

    let pollEvents: PollEvent[] = [];
    let pollRunning = false;

    function pollEvents() {
        while (pollEvents.length > 0) {
            const now = control.millis();
            let needsCleanup = false;
            for (let i = 0; i < pollEvents.length; ++i) {
                const ev = pollEvents[i];
                if (ev.condition() || (ev.timeOut > 0 && now - ev.start > ev.timeOut)) {
                    control.raiseEvent(ev.eid, ev.vid);
                    if (ev.once) {
                        ev.condition = undefined;
                        needsCleanup = true;
                    }
                }
            }
            if (needsCleanup)
                pollEvents = pollEvents.filter(ev => !!ev.condition);
            loops.pause(50);
        }
        pollRunning = false;
    }

    function queuePollEvent(timeOut: number, condition: () => boolean, handler: () => void) {
        const ev = {
            eid: control.allocateNotifyEvent(),
            vid: 1,
            start: control.millis(),
            timeOut: timeOut || 0,
            condition: condition,
            once: !handler
        };
        // register event
        if (handler)
            control.onEvent(ev.eid, ev.vid, handler);
        pollEvents.push(ev)
        // start polling fibier if needed
        if (!pollRunning) {
            pollRunning = true;
            control.runInBackground(pollEvents);
        }
        // register wait
        if (!handler)
            control.waitForEvent(ev.eid, ev.vid);
    }

    /**
     * Busy wait for a condition to be true
     * @param condition condition to test for
     * @param timeOut if positive, maximum duration to wait for in milliseconds
     */
    //% 
    // add block when PXT supports this signature
    export function waitUntil(condition: () => boolean, timeOut?: number): void {
        if (!condition || condition()) return; // optimistic path
        queuePollEvent(timeOut, condition, undefined);
    }

    /**
     * Runs code when the condition becomes true
     * @param condition condition to test
     * @param handler code to run
     */
    //%
    export function when(condition: () => boolean, handler: () => void) {
        if (!condition || !handler) return;
        queuePollEvent(0, condition, handler);
    }
}
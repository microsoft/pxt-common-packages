namespace loops {
    class PollEvent {
        public eid: number; 
        public vid: number; 
        public start: number; 
        public timeOut: number; 
        public condition: () => boolean; 
        public once: boolean;
        constructor(eid: number, vid: number, start: number, timeOut: number, condition: () => boolean, once: boolean) {
            this.eid = eid;
            this.vid = vid;
            this.start = start;
            this.timeOut = timeOut;
            this.condition = condition;
            this.once = once;
        }
    }

    let _pollEventQueue: PollEvent[] = undefined;

    function pollEvents() {
        while (_pollEventQueue.length > 0) {
            const now = control.millis();
            for (let i = 0; i < _pollEventQueue.length; ++i) {
                const ev = _pollEventQueue[i];
                if (ev.condition() || (ev.timeOut > 0 && now - ev.start > ev.timeOut)) {
                    control.raiseEvent(ev.eid, ev.vid);
                    if (ev.once) {
                        _pollEventQueue.splice(i, 1);
                        --i;
                    }
                }
            }
            loops.pause(50);
        }
        // release fiber
        _pollEventQueue = undefined;
    }

    function queuePollEvent(timeOut: number, condition: () => boolean, handler: () => void) {
        const ev = new PollEvent(
            control.allocateNotifyEvent(),
            1,
            control.millis(),
            timeOut,
            condition,
            !handler
        );

        // start polling fiber if needed
        if (!_pollEventQueue) {
            _pollEventQueue = [];
            control.runInBackground(pollEvents);
        }
        
        // add to the queue
        _pollEventQueue.push(ev)

        // register event
        if (handler)
            control.onEvent(ev.eid, ev.vid, handler);
        else // or wait
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
        if (!timeOut) timeOut = 0;
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
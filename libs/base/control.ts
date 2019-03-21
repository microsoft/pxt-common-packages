/**
* Program controls and events.
*/
//% weight=10 color="#31bca3" icon="\uf110" advanced=true
namespace control {
    /**
     * Deprecated, use ``control.runInParallel`` instead.
     */
    //% deprecated=1 hidden=1 help=control/run-in-background blockAllowMultiple=1 afterOnStart=true
    //% blockId="control_run_in_background" block="run in background" blockGap=8 weight=0
    export function runInBackground(a: () => void) {
        control.runInParallel(a);
    }

    /**
     * Display an error code and stop the program.
     * @param code an error number to display. eg: 5
     */
    //% help=control/panic weight=29
    //% blockId="control_panic" block="panic %code"
    //% shim=pxtrt::panic
    export function panic(code: number) { }

    /**
     * Enable profiling for current function.
     */
    //% shim=TD_NOOP shimArgument=perfCounter
    export function enablePerfCounter(name?: string) { }

    /**
     * Dump values of profiling performance counters.
     */
    //% shim=pxt::dumpPerfCounters
    export function dmesgPerfCounters() { }

    /**
     * Display an error code and stop the program when the assertion is `false`.
     */
    //% help=control/assert weight=30
    //% blockId="control_assert" block="assert %cond|with value %code"
    export function assert(cond: boolean, code: number) {
        if (!cond) {
            fail("Assertion failed, code=" + code)
        }
    }

    export function fail(message: string) {
        console.log("Fatal failure: ")
        console.log(message)
        panic(108)
    }

    export class AnimationQueue {
        running: boolean;
        eventID: number;
        public interval: number;

        constructor() {
            this.running = false;
            this.eventID = control.allocateNotifyEvent();
            this.interval = 1;
        }

        /**
         * Runs 'render' in a loop until it returns false or the 'stop' function is called
         */
        runUntilDone(render: () => boolean) {
            const evid = this.eventID;

            // if other animation, wait for turn
            if (this.running)
                control.waitForEvent(DAL.DEVICE_ID_NOTIFY, evid);

            // check if the animation hasn't been cancelled since we've waiting
            if (this.isCancelled(evid))
                return;

            // run animation
            this.running = true;
            while (this.running
                && !this.isCancelled(evid)
                && render()) {
                pause(this.interval);
            }

            // check if the animation hasn't been cancelled since we've been waiting
            if (this.isCancelled(evid))
                return;

            // we're done
            this.running = false;
            // unblock 1 fiber
            control.raiseEvent(DAL.DEVICE_ID_NOTIFY_ONE, this.eventID);
        }

        isCancelled(evid: number) {
            return this.eventID !== evid;
        }

        /**
         * Cancels the current running animation and clears the queue
         */
        cancel() {
            if (this.running) {
                this.running = false;
                const evid = this.eventID;
                this.eventID = control.allocateNotifyEvent();
                // unblock fibers
                control.raiseEvent(DAL.DEVICE_ID_NOTIFY, evid);
            }
        }
    }

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
            pause(50);
        }
        // release fiber
        _pollEventQueue = undefined;
    }

    export function __queuePollEvent(timeOut: number, condition: () => boolean, handler: () => void) {
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
            _pollEventQueue = [ev];
            control.runInParallel(pollEvents);
        }
        else {
            // add to the queue
            _pollEventQueue.push(ev)
        }

        // register event
        if (handler)
            control.onEvent(ev.eid, ev.vid, handler);
        else // or wait
            control.waitForEvent(ev.eid, ev.vid);
    }

    //% shim=pxt::getConfig
    export declare function getConfigValue(key: int32, defl: int32): number;

    //% shim=pxt::programHash
    export function programHash(): number { return 0 }

    export enum IntervalMode {
        Interval,
        Timeout,
        Immediate
    }

    let _intervals: Interval[] = undefined;
    class Interval {

        id: number;
        func: () => void;
        delay: number;
        mode: IntervalMode;

        constructor(func: () => void, delay: number, mode: IntervalMode) {
            this.id = _intervals.length == 0
                ? 1 : _intervals[_intervals.length - 1].id + 1;
            this.func = func;
            this.delay = delay;
            this.mode = mode;
            _intervals.push(this);

            control.runInParallel(() => this.work());
        }

        work() {
            // execute
            switch (this.mode) {
                case IntervalMode.Immediate:
                case IntervalMode.Timeout:
                    if (this.delay > 0)
                        pause(this.delay); // timeout
                    if (this.delay >= 0) // immediate, timeout
                        this.func();
                    break;
                case IntervalMode.Interval:
                    while (this.delay > 0) {
                        pause(this.delay);
                        // might have been cancelled during this duration
                        if (this.delay > 0)
                            this.func();
                    }
                    break;
            }
            // remove from interval array
            _intervals.removeElement(this);
        }

        cancel() {
            this.delay = -1;
        }
    }

    export function setInterval(func: () => void, delay: number, mode: IntervalMode): number {
        if (!func || delay < 0) return 0;
        if (!_intervals) _intervals = [];
        const interval = new Interval(func, delay, mode);
        return interval.id;
    }

    export function clearInterval(intervalId: number, mode: IntervalMode): void {
        if (!_intervals) return;
        for (let i = 0; i < _intervals.length; ++i) {
            const it = _intervals[i];
            if (it.id == intervalId && it.mode == mode) {
                it.cancel();
                break;
            }
        }
    }
}

/**
 * Busy wait for a condition to be true
 * @param condition condition to test for
 * @param timeOut if positive, maximum duration to wait for in milliseconds
 */
//% blockId="pxt_pause_until"
function pauseUntil(condition: () => boolean, timeOut?: number): void {
    if (!condition || condition()) return; // optimistic path
    if (!timeOut) timeOut = 0;
    control.__queuePollEvent(timeOut, condition, undefined);
}

/**
 * Repeats the code forever in the background. On each iteration, allows other codes to run.
 * @param body code to execute
 */
//% help=loops/forever weight=100 afterOnStart=true blockNamespace="loops"
//% blockId=forever block="forever" blockAllowMultiple=1
function forever(a: () => void): void {
    loops.forever(a);
}

/**
 * Pause for the specified time in milliseconds
 * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
 */
//% help=loops/pause weight=99
//% async block="pause %pause=timePicker|ms"
//% blockId=device_pause blockNamespace="loops"
function pause(ms: number): void {
    loops.pause(ms);
}

// micro:bit compatibility
// these functions allow some level of reuse
// between micro:bit and other maker-style editors
namespace basic {
    export function pause(millis: number) {
        loops.pause(millis);
    }
}

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

class UTF8Decoder {
    private buf: Buffer;

    constructor() {
        this.buf = undefined;
    }

    add(buf: Buffer) {
        if (!buf || !buf.length) return;

        if (!this.buf)
            this.buf = buf;
        else {
            const b = control.createBuffer(this.buf.length + buf.length);
            b.write(0, this.buf);
            b.write(this.buf.length, buf);
            this.buf = b;
        }
    }

    decodeUntil(delimiter: number): string {
        if (!this.buf) return undefined;
        delimiter = delimiter | 0;
        let i = 0;
        for (; i < this.buf.length; ++i) {
            const c = this.buf[i];
            // skip multi-chars
            if ((c & 0xe0) == 0xc0)
                i += 1;
            else if ((c & 0xf0) == 0xe0)
                i += 2;
            else if (c == delimiter) {
                // found it
                break;
            }
        }

        if (i >= this.buf.length)
            return undefined;
        else {
            const s = this.buf.slice(0, i).toString();
            if (i + 1 == this.buf.length)
                this.buf = undefined;
            else
                this.buf = this.buf.slice(i + 1);
            return s;
        }
    }

    decode(): string {
        if (!this.buf) return "";

        // scan the end of the buffer for partial characters
        let length = 0;
        for (let i = this.buf.length - 1; i >= 0; i--) {
            const c = this.buf[i];
            if ((c & 0x80) == 0) {
                length = i + 1;
                break;
            }
            else if ((c & 0xe0) == 0xc0) {
                length = i + 2;
                break;
            }
            else if ((c & 0xf0) == 0xe0) {
                length = i + 3;
                break;
            }
        }
        // is last beyond the end?
        if (length == this.buf.length) {
            const s = this.buf.toString();
            this.buf = undefined;
            return s;
        } else if (length == 0) { // data yet
            return "";
        } else {
            const s = this.buf.slice(0, length).toString();
            this.buf = this.buf.slice(length);
            return s;
        }
    }
}
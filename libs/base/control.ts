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

    export const enum PXT_PANIC {
        CODAL_OOM = 20,
        GC_OOM = 21,
        GC_TOO_BIG_ALLOCATION = 22,
        CODAL_HEAP_ERROR = 30,
        CODAL_NULL_DEREFERENCE = 40,
        CODAL_USB_ERROR = 50,
        CODAL_HARDWARE_CONFIGURATION_ERROR = 90,
    
        INVALID_BINARY_HEADER = 901,
        OUT_OF_BOUNDS = 902,
        REF_DELETED = 903,
        SIZE = 904,
        INVALID_VTABLE = 905,
        INTERNAL_ERROR = 906,
        NO_SUCH_CONFIG = 907,
        NO_SUCH_PIN = 908,
        INVALID_ARGUMENT = 909,
        MEMORY_LIMIT_EXCEEDED = 910,
        SCREEN_ERROR = 911,
        MISSING_PROPERTY = 912,
        INVALID_IMAGE = 913,
        CALLED_FROM_ISR = 914,
        HEAP_DUMPED = 915,
        STACK_OVERFLOW = 916,
        BLOCKING_TO_STRING = 917,
        VM_ERROR = 918,
        SETTINGS_CLEARED = 920,
        SETTINGS_OVERLOAD = 921,
        SETTINGS_SECRET_MISSING = 922,
        DELETE_ON_CLASS = 923,
        
        CAST_FIRST = 980,
        CAST_FROM_UNDEFINED = 980,
        CAST_FROM_BOOLEAN = 981,
        CAST_FROM_NUMBER = 982,
        CAST_FROM_STRING = 983,
        CAST_FROM_OBJECT = 984,
        CAST_FROM_FUNCTION = 985,
        CAST_FROM_NULL = 989,
    
        UNHANDLED_EXCEPTION = 999,
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
        dmesg(message)
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
    export declare function programHash(): number;

    //% shim=pxt::programName
    export declare function programName(): string;

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

    //% shim=control::_ramSize
    function _ramSize() {
        return 32 * 1024 * 1024;
    }

    /** Returns estimated size of memory in bytes. */
    export function ramSize() {
        return getConfigValue(DAL.CFG_RAM_BYTES, 0) || _ramSize();
    }

    /** Runs the function and returns run time in microseconds. */
    export function benchmark(f: () => void) {
        const t0 = micros()
        f()
        let t = micros() - t0
        if (t < 0)
            t += 0x3fffffff
        return t
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
 * Convert any value to text
 * @param value value to be converted to text
 */
//% help=text/convert-to-text weight=1
//% block="convert $value=math_number to text"
//% blockId=variable_to_text blockNamespace="text"
function convertToText(value: any): string {
    return "" + value;
}

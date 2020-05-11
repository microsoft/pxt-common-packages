namespace control {
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
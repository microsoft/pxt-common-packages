namespace pxsim.control {
    export var runInBackground = thread.runInBackground;
    export var delay = thread.pause;

    export function reset() {
        U.userError("reset not implemented in simulator yet")
    }
    export function waitMicros(micros: number) {
        thread.pause(micros / 1000); // it prempts not much we can do here.
    }
    export function deviceName(): string {
        let b = board();
        return b && b.id
            ? b.id.slice(0, 4)
            : "abcd";
    }
    export function deviceSerialNumber(): number {
        let b = board();
        return parseInt(b && b.id
            ? b.id.slice(1)
            : "42");
    }
    export function deviceDalVersion(): string {
        return "0.0.0";
    }
    export function onEvent(id: number, evid: number, handler: RefAction) {
        pxtcore.registerWithDal(id, evid, handler)
    }

    export function waitForEvent(id: number, evid: number) {
        const cb = getResume();
        board().bus.wait(id, evid, cb);
    }

    export function allocateNotifyEvent() : number {
        let b = board();
        return b.bus.nextNotifyEvent++;
    }

    export function raiseEvent(id: number, evid: number, mode: number) {
        // TODO mode?
        board().bus.queue(id, evid)
    }

    export function millis(): number {
        return runtime.runningTime();
    }

    export function delayMicroseconds(us: number) {
        delay(us / 0.001);
    }
}

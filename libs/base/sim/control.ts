namespace pxsim.pxtcore {
    // TODO: add in support for mode, as in CODAL
    export function registerWithDal(id: number, evid: number, handler: RefAction, mode: number = 0) {
        board().bus.listen(id, evid, handler);
    }

    export function deepSleep() {
        // TODO?
        console.log("deep sleep requested")
    }
}

namespace pxsim.control {
    export let runInParallel = thread.runInBackground;
    export let delay = thread.pause;

    export function reset() {
        pxsim.Runtime.postMessage(<pxsim.SimulatorCommandMessage>{
            type: "simulator",
            command: "restart"
        })
        const cb = getResume();
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
        if (!b) return 42;
        let n = 0;
        if (b.id) {
            n = parseInt(b.id.slice(1));
            if (isNaN(n)) {
                n = 0;
                for (let i = 0; i < b.id.length; ++i) {
                    n = ((n << 5) - n) + b.id.charCodeAt(i);
                    n |= 0;
                }
                n = Math.abs(n);
            }
        }
        if (!n) n = 42;
        return n;
    }
    export function deviceDalVersion(): string {
        return "0.0.0";
    }
    export function internalOnEvent(id: number, evid: number, handler: RefAction) {
        pxtcore.registerWithDal(id, evid, handler)
    }
    export function waitForEvent(id: number, evid: number) {
        const cb = getResume();
        board().bus.wait(id, evid, cb);
    }

    export function allocateNotifyEvent(): number {
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

    export function createBuffer(size: number) {
        return BufferMethods.createBuffer(size)
    }
    export function dmesg(msg: string) {
        console.log(`DMESG: ${msg}`);
    }
    function toStr(v: any) {
        if (v instanceof RefRecord) {
            return `${v.vtable.name}@${v.id}`
        }

        if (v instanceof RefCollection) {
            let r = "["
            for (let e of v.toArray()) {
                if (r.length > 200) {
                    r += "..."
                    break
                }
                r += toStr(e) + ", "
            }
            r += "]"
            return r
        }

        return v + ""
    }
    export function dmesgPtr(msg: string, ptr: any) {
        console.log(`DMESG: ${msg} ${toStr(ptr)}`);
    }
    export function dmesgValue(ptr: any) {
        console.log(`DMESG: ${toStr(ptr)}`);
    }
    export function gc() { }
    export function profilingEnabled() {
        return !!runtime.perfCounters
    }

    export function __log(priority: number, str: string) {
        let prefix = "";
        switch (priority) {
            case 0: prefix = "d>"; break;
            case 1: prefix = "l>"; break;
            case 2: prefix = "w>"; break;
            case 3: prefix = "e>"; break;
        }
        console.log(prefix + str);
        runtime.board.writeSerial(str);
    }

    export function heapDump() {
        // TODO something better
    }
}

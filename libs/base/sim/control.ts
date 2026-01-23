namespace pxsim.pxtcore {
    // TODO: add in support for mode, as in CODAL
    export function registerWithDal(id: number, evid: number, handler: RefAction, mode: number = 0) {
        board().bus.listen(id, evid, handler, mode);
    }

    export function deepSleep() {
        // TODO?
        console.log("deep sleep requested")
    }
}

namespace pxsim.BufferMethods {
    function fnv1(data: Uint8Array) {
        let h = 0x811c9dc5
        for (let i = 0; i < data.length; ++i) {
            h = (Math as any).imul(h, 0x1000193) ^ data[i]
        }
        return h
    }

    export function hash(buf: RefBuffer, bits: number) {
        BufferMethods.typeCheck(buf);
        bits |= 0
        if (bits < 1)
            return 0
        const h = fnv1(buf.data)
        if (bits >= 32)
            return h >>> 0
        else
            return ((h ^ (h >>> bits)) & ((1 << bits) - 1)) >>> 0
    }
}

namespace pxsim.control {
    export let runInParallel = thread.runInBackground;
    export let delay = thread.pause;

    export function reset() {
        pxsim.Runtime.postMessage(<pxsim.SimulatorCommandMessage>{
            type: "simulator",
            command: "restart",
            controlReset: true
        })
        const cb = getResume();
    }
    export function singleSimulator() {
        pxsim.Runtime.postMessage(<pxsim.SimulatorCommandMessage>{
            type: "simulator",
            command: "single"
        })
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
    export function _ramSize() {
        return 32 * 1024 * 1024;
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
    export function deviceLongSerialNumber(): RefBuffer {
        let b = control.createBuffer(8);
        BufferMethods.setNumber(b, BufferMethods.NumberFormat.UInt32LE, 0, deviceSerialNumber())
        return b;
    }
    export function deviceDalVersion(): string {
        return "sim";
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

    export function micros(): number {
        return runtime.runningTimeUs() & 0x3fffffff;
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
    export function setDebugFlags(flags: number): void {
        console.log(`debug flags: ${flags}`);
    }
    export function heapSnapshot(): void {
        console.log(runtime.traceObjects())
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

        if (typeof v == "function") {
            return (v + "").slice(0, 60) + "..."
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
        switch (priority) {
            case 0: console.debug("d>" + str); break;
            case 1: console.log("l>" + str); break;
            case 2: console.warn("w>" + str); break;
            case 3: console.error("e>" + str); break;
        }
        runtime.board.writeSerial(str);
    }

    export function heapDump() {
        // TODO something better
    }

    export function isUSBInitialized() {
        return false;
    }
}

// keep in sync with pxtbase.h
namespace pxsim {
    export const enum PXT_PANIC {
        PANIC_CODAL_OOM = 20,
        PANIC_GC_OOM = 21,
        PANIC_GC_TOO_BIG_ALLOCATION = 22,
        PANIC_CODAL_HEAP_ERROR = 30,
        PANIC_CODAL_NULL_DEREFERENCE = 40,
        PANIC_CODAL_USB_ERROR = 50,
        PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR = 90,

        PANIC_INVALID_BINARY_HEADER = 901,
        PANIC_OUT_OF_BOUNDS = 902,
        PANIC_REF_DELETED = 903,
        PANIC_SIZE = 904,
        PANIC_INVALID_VTABLE = 905,
        PANIC_INTERNAL_ERROR = 906,
        PANIC_NO_SUCH_CONFIG = 907,
        PANIC_NO_SUCH_PIN = 908,
        PANIC_INVALID_ARGUMENT = 909,
        PANIC_MEMORY_LIMIT_EXCEEDED = 910,
        PANIC_SCREEN_ERROR = 911,
        PANIC_MISSING_PROPERTY = 912,
        PANIC_INVALID_IMAGE = 913,
        PANIC_CALLED_FROM_ISR = 914,
        PANIC_HEAP_DUMPED = 915,

        PANIC_CAST_FIRST = 980,
        PANIC_CAST_FROM_UNDEFINED = 980,
        PANIC_CAST_FROM_BOOLEAN = 981,
        PANIC_CAST_FROM_NUMBER = 982,
        PANIC_CAST_FROM_STRING = 983,
        PANIC_CAST_FROM_OBJECT = 984,
        PANIC_CAST_FROM_FUNCTION = 985,
        PANIC_CAST_FROM_NULL = 989,

    }
}
namespace control {
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
}

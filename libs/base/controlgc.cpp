#include "pxtbase.h"


namespace control {
    /**
     * Force GC and dump basic information about heap.
     */
    //%
    void gc() {
        pxt::gc(1);
    }

    /**
     * Force GC and halt waiting for debugger to do a full heap dump.
     */
    //%
    void heapDump() {
        pxt::gc(2);
        soft_panic(PANIC_HEAP_DUMPED);
    }


    /**
     * Set flags used when connecting an external debugger.
     */
    //%
    void setDebugFlags(int flags) {
        debugFlags = flags;
    }

    /**
     * Record a heap snapshot to debug memory leaks.
     */
    //%
    void heapSnapshot() {
        // only in JS backend for now
    }

    /**
     * Return true if profiling is enabled in the current build.
     */
    //%
    bool profilingEnabled() {
#ifdef PXT_PROFILE
        return true;
#else
        return false;
#endif
    }
}

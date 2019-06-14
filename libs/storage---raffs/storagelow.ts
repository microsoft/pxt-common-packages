namespace storage {
    //% shim=pxt::seedAddRandom
    function seedAddRandom(n: number) { }

    export function runNumber() {
        let runBuf = storage.readAsBuffer("#run")
        if (runBuf)
            return runBuf.getNumber(NumberFormat.UInt32LE, 0)
        return 0
    }

    function initScopes() {
        let runBuf = storage.readAsBuffer("#run")
        if (!runBuf || !runBuf.length) runBuf = control.createBuffer(4)
        let rn = runBuf.getNumber(NumberFormat.UInt32LE, 0)
        runBuf.setNumber(NumberFormat.UInt32LE, 0, rn + 1)
        control.dmesg("rn: " + rn)
        storage.overwriteWithBuffer("#run", runBuf)

        seedAddRandom(control.deviceSerialNumber() & 0x7fffffff)
        seedAddRandom(rn)
    }

    initScopes()

    export let _scopedClean: () => boolean

    function cleanup(phase: number) {
        if (phase == 0 && _scopedClean) {
            if (_scopedClean())
                return
        }

        let numdel = 0

        // cleanup phase 1 - delete all non-system
        for (let fn of storage.list()) {
            numdel++
            storage.remove(fn)
        }

        // if that didn't work, remove all files
        if (numdel == 0) {
            // OK, also delete system files
            for (let fn of storage._list()) {
                storage.remove(fn)
            }
        }

        // and panic - reset should hopefully recreate needed files
        control.panic(919)
    }

    /** 
     * Append a buffer to a new or existing file. 
     * @param filename name of the file, eg: "log.txt"
     */
    //% parts="storage"
    export function appendBuffer(filename: string, data: Buffer): void {
        let k = 0
        while (_appendBuffer(filename, data) != 0)
            cleanup(k++);
    }

    /** 
     * Overwrite file with a buffer. 
     * @param filename name of the file, eg: "log.txt"
     */
    //% parts="storage"
    export function overwriteWithBuffer(filename: string, data: Buffer): void {
        let k = 0
        while (_overwriteWithBuffer(filename, data) != 0)
            cleanup(k++);
    }

    /**
     * Return a list of all files in the filesystem.
     */
    //% parts="storage"
    //% blockId="storage_list" block="list files"
    export function list() {
        // exclude internal files
        return _list().filter(s => s.charAt(0) != '#')
    }
}

declare namespace storage {
    //% shim=storage::_list
    function _list(): string[];
}

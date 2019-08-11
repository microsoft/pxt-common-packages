namespace settings {
    //% shim=pxt::seedAddRandom
    declare function seedAddRandom(n: number): void;

    //% shim=settings::_set
    declare function _set(key: string, data: Buffer): int32;

    //% shim=settings::_remove
    declare function _remove(key: string): int32;

    //% shim=settings::_exists
    declare function _exists(key: string): boolean;

    //% shim=settings::_get
    declare function _get(key: string): Buffer;

    //% shim=settings::_userClean
    declare function _userClean(): void;

    //% shim=settings::_list
    declare function _list(prefix: string): string[];

    //% shim=settings::_setScope
    declare function _setScope(scope: string): void;

    export function runNumber() {
        let runBuf = _get("#run")
        if (runBuf)
            return runBuf.getNumber(NumberFormat.UInt32LE, 0)
        return 0
    }

    function initScopes() {
        let runBuf = _get("#run")
        if (!runBuf || !runBuf.length) runBuf = control.createBuffer(4)
        let rn = runBuf.getNumber(NumberFormat.UInt32LE, 0)
        runBuf.setNumber(NumberFormat.UInt32LE, 0, rn + 1)
        control.dmesg("rn: " + rn)
        writeBuffer("#run", runBuf)

        seedAddRandom(control.deviceSerialNumber() & 0x7fffffff)
        seedAddRandom(rn)

        // TODO change this to program name
        _setScope("H-" + control.programHash())
    }

    initScopes()

    /** 
     * Delete all non-system settings.
     */
    export function clear(): void {
        _userClean()
    }

    /**
     * Set named setting to a given buffer.
     */
    export function writeBuffer(key: string, value: Buffer) {
        if (_set(key, value)) {
            // if we're out of space, clear user storage
            _userClean()
            // and panic - reset should hopefully recreate needed files
            control.panic(919)
        }
    }

    /**
     * Set named settings to a given string.
     */
    export function writeString(key: string, value: string) {
        writeBuffer(key, control.createBufferFromUTF8(value))
    }

    /**
     * Set named settings to a given number.
     */
    export function writeNumber(key: string, value: number) {
        writeBuffer(key, msgpack.packNumberArray([value]))
    }

    /**
     * Read named setting as a buffer. Returns undefined when setting not found.
     */
    export function readBuffer(key: string) {
        return _get(key)
    }

    /**
     * Read named setting as a string.
     */
    export function readString(key: string) {
        const buf = readBuffer(key)
        if (!buf)
            return undefined
        else
            return buf.toString()
    }

    /**
     * Read named setting as a number.
     */
    export function readNumber(key: string) {
        const buf = readBuffer(key)
        if (!buf)
            return undefined
        else {
            const nums = msgpack.unpackNumberArray(buf)
            if (nums && nums.length >= 1)
                return nums[0]
            return undefined
        }
    }


    /**
     * Return a list of settings starting with a given prefix.
     */
    export function list(prefix: string = "") {
        return _list(prefix)
    }

    /**
     * Remove named setting.
     */
    export function remove(key: string) {
        _remove(key)
    }

    /**
     * Check if a named setting exists.
     */
    export function exists(key: string) {
        return _exists(key)
    }
}

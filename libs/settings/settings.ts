namespace settings {
    const RUN_KEY = "#run";
    const SCOPE_KEY = "#scope";
    const SECRETS_KEY = "#secrets";

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

    export function runNumber() {
        return readNumber(RUN_KEY) || 0
    }

    function setScope(scope: string) {
        if (!scope || scope.length > 100)
            control.panic(922)
        const currScope = readString(SCOPE_KEY)
        if (currScope != scope) {
            _userClean()
            writeString(SCOPE_KEY, scope)
        }
    }

    function initScopes() {
        const rn = runNumber() + 1
        writeNumber(RUN_KEY, rn)

        seedAddRandom(control.deviceSerialNumber() & 0x7fffffff)
        seedAddRandom(rn)

        setScope(control.programName())
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
            control.panic(920)
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
     * Set named settings to a given array of numbers.
     */
    export function writeNumberArray(key: string, value: number[]) {
        writeBuffer(key, msgpack.packNumberArray(value))
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
     * Read named setting as a number.
     */
    export function readNumberArray(key: string) {
        const buf = readBuffer(key)
        if (!buf)
            return undefined
        else
            return msgpack.unpackNumberArray(buf)
    }

    /**
     * Return a list of settings starting with a given prefix.
     */
    export function list(prefix?: string) {
        if (!prefix) prefix = ""
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


    export function writeSecret(name: string, value: any) {
        const secrets = readSecrets();
        secrets[name] = value;
        writeString(SECRETS_KEY, JSON.stringify(secrets));
    }

    export function readSecret(name: string): any {
        const secrets = readSecrets();
        return secrets[name];
    }

    export function clearSecrets() {
        writeString(SECRETS_KEY, "{}");
    }

    function readSecrets(): any {
        try {
            const src = readString(SECRETS_KEY) || "{}";
            return JSON.parse(src);
        } catch {
            return {};
        }
    }
}

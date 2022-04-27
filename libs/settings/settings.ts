namespace settings {
    const RUN_KEY = "#run";
    const SCOPE_KEY = "#scope";
    const DEVICE_SECRETS_KEY = "#secrets";
    const SECRETS_KEY = "__secrets";

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
     * Set named settings to a given JSON object.
     */
    export function writeJSON(key: string, value: any) {
        writeString(key, JSON.stringify(value))
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
     * Read named setting as a JSON object.
     */
    export function readJSON(key: string) {
        const s = readString(key)
        if (s)
            return JSON.parse(s)
        return undefined
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

    function clone(v: any): any {
        if (v == null) return null
        return JSON.parse(JSON.stringify(v))
    }

    function isKV(v: any) {
        return !!v && typeof v === "object" && !Array.isArray(v)
    }

    function jsonMergeFrom(trg: any, src: any) {
        if (!src) return;
        const keys = Object.keys(src)
        keys.forEach(k => {
            const srck = src[k];
            if (isKV(trg[k]) && isKV(srck))
                jsonMergeFrom(trg[k], srck);
            else
                trg[k] = clone(srck);
        });
    }

    //% fixedInstances
    export class SecretStore {
        constructor(private key: string) { }

        setSecret(name: string, value: any) {
            const secrets = this.readSecrets();
            secrets[name] = value;
            writeJSON(this.key, secrets);
        }

        updateSecret(name: string, value: any) {
            const secrets = this.readSecrets();
            const secret = secrets[name];
            if (secret === undefined)
                secrets[name] = value;
            else jsonMergeFrom(secret, value);
            writeJSON(this.key, secrets)
        }

        readSecret(name: string, ensure: boolean = false): any {
            const secrets = this.readSecrets();
            const secret = secrets[name];
            if (ensure && !secret)
                throw "missing secret " + name;
            return secret;
        }

        clearSecrets() {
            writeString(this.key, "{}");
        }

        readSecrets(): any {
            try {
                return readJSON(this.key) || {}
            } catch {
                control.dmesg("invalid secret format")
                return {};
            }
        }
    }

    /**
     * Secrets shared by any program on the device
     */
    //% fixedInstance whenUsed block="device secrets"
    export const deviceSecrets = new SecretStore(DEVICE_SECRETS_KEY);

    /**
     * Program secrets
     */
    //% fixedInstance whenUsed block="program secrets"
    export const programSecrets = new SecretStore(SECRETS_KEY);
}

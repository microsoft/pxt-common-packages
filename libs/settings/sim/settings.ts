namespace pxsim.settings {
    let scope: string
    let currSize = 0
    const storage = window.localStorage
    const MAX_SIZE = 32 * 1024

    export function _setScope(newScope: string): void {
        scope = newScope
        if (!newScope || newScope.length > 100)
            U.userError("invalid scope: " + newScope)
        computeSize()
    }

    function encodeKey(key: string) {
        return "S/" + scope + "///" + key
    }

    function allKeys() {
        const mykeys: string[] = []
        const pref = encodeKey("")
        for (let i = 0; i < storage.length; ++i) {
            const k = storage.key(i)
            if (k && k.slice(0, pref.length) == pref)
                mykeys.push(k)
        }
        return mykeys
    }

    function computeSize() {
        let sz = 0
        for (let k of allKeys()) {
            sz += k.length + storage[k].length
        }
        currSize = sz
    }

    export function _set(key: string, buf: RefBuffer) {
        key = encodeKey(key)
        const prev = storage[key]
        const newSize = prev == null
            ? currSize + key.length + buf.data.length
            : currSize + buf.data.length - prev.length
        if (newSize > MAX_SIZE)
            return -1
        storage[key] = U.uint8ArrayToString(buf.data)
        currSize = newSize
        return 0;
    }

    export function _remove(key: string) {
        key = encodeKey(key)
        if (storage[key] == null)
            return -1
        currSize -= key.length + storage[key].length
        storage.removeItem(key)
        return 0
    }

    export function _exists(key: string): boolean {
        return _get(key) != null
    }

    export function _get(key: string): RefBuffer {
        key = encodeKey(key)
        const val = storage[key] as string
        if (val == null)
            return undefined
        return new RefBuffer(U.stringToUint8Array(val))
    }

    export function _userClean(): void {
        for (let k of allKeys())
            storage.removeItem(k)
        computeSize()
    }

    export function _list(prefix: string): RefCollection {
        const r = new RefCollection()

        const emptyPref = encodeKey("")
        for (let k of allKeys()) {
            const n = k.slice(emptyPref.length)
            if (prefix == "" && n[0] == "#")
                continue
            if (n.slice(0, prefix.length) != prefix)
                continue
            r.push(n)
        }

        return r
    }
}

namespace pxsim.settings {
    let currSize = 0
    const MAX_SIZE = 32 * 1024

    export function _setScope(newScope: string): void {
        if (!newScope || newScope.length > 100)
            U.userError("invalid scope: " + newScope)
        const st = board().storedState
        const key = encodeKey("#scope")
        if (newScope != st[key]) {
            _userClean()
            board().setStoredState(key, newScope)
            computeSize()
        }
    }

    function encodeKey(key: string) {
        return "S/" + key
    }

    function allKeys() {
        const pref = encodeKey("")
        const st = board().storedState
        return Object.keys(st).filter(k => k.slice(0, pref.length) == pref)
    }

    function userKeys() {
        return allKeys().filter(s => s[2] != "#")
    }

    function computeSize() {
        let sz = 0
        const storage = board().storedState
        for (let k of allKeys()) {
            sz += k.length + storage[k].length
        }
        currSize = sz
    }

    export function _set(key: string, buf: RefBuffer) {
        key = encodeKey(key)
        const storage = board().storedState
        const prev = storage[key]
        const newSize = prev == null
            ? currSize + key.length + buf.data.length
            : currSize + buf.data.length - prev.length
        if (newSize > MAX_SIZE)
            return -1
        board().setStoredState(key, U.uint8ArrayToString(buf.data))
        currSize = newSize
        return 0;
    }

    export function _remove(key: string) {
        key = encodeKey(key)
        const storage = board().storedState
        if (storage[key] == null)
            return -1
        currSize -= key.length + storage[key].length
        board().setStoredState(key, null)
        return 0
    }

    export function _exists(key: string): boolean {
        return _get(key) != undefined
    }

    export function _get(key: string): RefBuffer {
        key = encodeKey(key)
        const storage = board().storedState
        const val = storage[key] as string
        if (val == null)
            return undefined
        return new RefBuffer(U.stringToUint8Array(val))
    }

    export function _userClean(): void {
        for (let k of userKeys())
            board().setStoredState(k, null)
        computeSize()
    }

    export function _list(prefix: string): RefCollection {
        const r = new RefCollection()

        const emptyPref = encodeKey("")
        for (let k of prefix[0] == "#" ? allKeys() : userKeys()) {
            const n = k.slice(emptyPref.length)
            if (n.slice(0, prefix.length) != prefix)
                continue
            r.push(n)
        }

        return r
    }
}

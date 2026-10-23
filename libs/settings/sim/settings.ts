namespace pxsim.settings {
    let currSize = 0
    const MAX_SIZE = 16 * 1024

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
        BufferMethods.typeCheck(buf);
        key = encodeKey(key)
        const storage = board().storedState
        const prev = storage[key]
        const val = btoa(U.uint8ArrayToString(buf.data)) as string
        const newSize = prev == null
            ? currSize + key.length + val.length
            : currSize + val.length - prev.length
        if (newSize > MAX_SIZE)
            return -1
        board().setStoredState(key, val)
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
        return new RefBuffer(U.stringToUint8Array(atob(val)))
    }

    export function _userClean(): void {
        for (let k of userKeys())
            board().setStoredState(k, null)
        computeSize()
        // if system keys take more than 25% of space, delete everything
        if (currSize > MAX_SIZE / 4) {
            for (let k of allKeys())
                board().setStoredState(k, null)
            computeSize()
        }
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

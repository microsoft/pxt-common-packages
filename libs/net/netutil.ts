namespace net {
    export function urlencode(s: string) {
        const buf = Buffer.fromUTF8(s)
        let r = ""
        for (let i = 0; i < buf.length; ++i) {
            const c = buf[i]
            if ((48 <= c && c <= 57) ||
                (97 <= (c | 0x20) && (c | 0x20) <= 122) ||
                (c == 45 || c == 46 || c == 95 || c == 126))
                r += String.fromCharCode(c)
            else
                r += "%" + buf.slice(i, 1).toHex()
        }
        return r
    }

    export function urldecode(s: string) {
        let r = ""
        let isUtf8 = false
        for (let i = 0; i < s.length; ++i) {
            const c = s[i]
            if (c == "%") {
                const h = s.slice(i + 1, i + 3)
                const chcode = parseInt(h, 16)
                if (!isNaN(chcode)) {
                    if (chcode > 127)
                        isUtf8 = true
                    r += String.fromCharCode(chcode)
                    i += 2
                    continue
                }
            }
            r += c
        }
        if (isUtf8) {
            const buf = Buffer.create(r.length)
            for (let i = 0; i < buf.length; ++i)
                buf[i] = r.charCodeAt(i)
            return buf.toString()
        } else {
            return r
        }
    }
}
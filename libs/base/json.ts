namespace JSON {
    export function parseIntRadix(s: string, base?: number) {
        if (base == null || base == 10) {
            return parseFloat(s) | 0
        }

        let m = false
        let r = 0
        for (let i = 0; i < s.length; ++i) {
            let c = s.charCodeAt(i)
            if (c == 0x20 || c == 10 || c == 13 || c == 9)
                continue
            if (r == 0 && !m && c == 0x2d) {
                m = true
                continue
            }

            let v = -1
            if (0x30 <= c && c <= 0x39)
                v = c - 0x30
            else {
                c |= 0x20
                if (0x61 <= c && c <= 0x7a)
                    v = c - 0x61 + 10
            }

            if (0 <= v && v < base) {
                r *= base
                r += v
            } else {
                return undefined
            }
        }

        return m ? -r : r
    }


    class Parser {
        ptr: number
        s: string
        errorMsg: string

        error(msg: string) {
            if (!this.errorMsg) {
                this.errorMsg = msg + " at position " + this.ptr
                this.ptr = this.s.length
            }
        }

        skipWS() {
            for (; ;) {
                const c = this.nextChar()
                if (c == 0x20 || c == 0x0a || c == 0x0d || c == 0x09) {
                    // OK
                } else {
                    this.ptr--
                    return c
                }
            }
        }

        nextChar() {
            if (this.ptr < this.s.length)
                return this.s.charCodeAt(this.ptr++)
            return 0
        }

        doString() {
            let r = ""
            this.ptr++
            for (; ;) {
                const c = this.s.charAt(this.ptr++)
                if (c == "\"")
                    return r
                if (c == "\\") {
                    let q = this.s.charAt(this.ptr++)
                    if (q == "b") q = "\b"
                    else if (q == "n") q = "\n"
                    else if (q == "r") q = "\r"
                    else if (q == "t") q = "\t"
                    else if (q == "u") {
                        q = String.fromCharCode(parseIntRadix(this.s.slice(this.ptr, this.ptr + 4), 16))
                        this.ptr += 4
                    }
                    r += q
                } else {
                    r += c
                }
            }
        }

        doArray(): any[] {
            const r = []
            this.ptr++
            for (; ;) {
                let c = this.skipWS()
                if (c == 0x5d) {
                    this.ptr++
                    return r
                }
                const v = this.value()
                if (this.errorMsg)
                    return null
                r.push(v)
                c = this.skipWS()
                if (c == 0x2c) {
                    this.ptr++
                    continue
                }
                if (c == 0x5d)
                    continue
                this.error("expecting comma")
            }
        }

        doObject() {
            const r: any = {}
            this.ptr++
            for (; ;) {
                let c = this.skipWS()
                if (c == 0x7d) {
                    this.ptr++
                    return r
                }
                if (c != 0x22) {
                    this.error("expecting key")
                    return r
                }
                const k = this.doString()
                c = this.skipWS()
                if (c != 0x3a) {
                    this.error("expecting colon")
                    return r
                }
                this.ptr++
                const v = this.value()
                if (this.errorMsg)
                    return null
                r[k] = v
                c = this.skipWS()
                if (c == 0x2c) {
                    this.ptr++
                    continue
                }
                if (c == 0x7d)
                    continue
                this.error("expecting comma, got " + String.fromCharCode(c))
            }
        }

        doNumber() {
            const beg = this.ptr
            for (; ;) {
                const c = this.nextChar()
                if ((0x30 <= c && c <= 0x39) || c == 0x2b || c == 0x2d || c == 0x2e || c == 0x45 || c == 0x65) {
                    // one more
                } else {
                    this.ptr--
                    break
                }
            }
            const ss = this.s.slice(beg, this.ptr)
            if (ss.length == 0) {
                this.error("expecting number")
                return 0
            }
            return parseFloat(ss)
        }

        checkKw(k: string) {
            if (this.s.slice(this.ptr, this.ptr + k.length) == k) {
                this.ptr += k.length
                return true
            }
            return false
        }

        value() {
            if (this.errorMsg)
                return null

            const c = this.skipWS()
            if (c == 0x7b)
                return this.doObject()
            else if (c == 0x5b)
                return this.doArray()
            else if ((0x30 <= c && c <= 0x39) || c == 0x2d)
                return this.doNumber()
            else if (c == 0x22)
                return this.doString()
            else if (c == 0x74 && this.checkKw("true"))
                return true
            else if (c == 0x66 && this.checkKw("false"))
                return false
            else if (c == 0x6e && this.checkKw("null"))
                return null

            this.error("unexpected token")
            return null
        }
    }

    class Stringifier {
        currIndent: string
        indentStep: string
        indent: number

        doString(s: string) {
            let r = "\""
            for (let i = 0; i < s.length; ++i) {
                let c = s[i]
                if (c == "\n") c = "\\n"
                else if (c == "\r") c = "\\r"
                else if (c == "\t") c = "\\t"
                else if (c == "\b") c = "\\b"
                else if (c == "\\") c = "\\\\"
                else if (c == "\"") c = "\\\""
                r += c
            }
            return r + "\""
        }

        go(v: any) {
            const t = typeof v
            if (t == "string")
                return this.doString(v)
            else if (t == "boolean" || t == "number" || v == null)
                return "" + v
            else if (Array.isArray(v)) {
                const arr = v as any[]
                if (arr.length == 0)
                    return "[]"
                else {
                    let r = "["
                    if (this.indent) {
                        this.currIndent += this.indentStep
                        r += "\n"
                    }
                    for (let i = 0; i < arr.length; ++i) {
                        r += this.currIndent + this.go(arr[i])
                        if (i != arr.length - 1)
                            r += ","
                        if (this.indent)
                            r += "\n"
                    }
                    if (this.indent)
                        this.currIndent = this.currIndent.slice(this.indent)
                    r += this.currIndent + "]"
                    return r
                }
            } else {
                const keys = Object.keys(v)
                if (keys.length == 0)
                    return "{}"

                let r = "{"
                if (this.indent) {
                    this.currIndent += this.indentStep
                    r += "\n"
                }
                for (let i = 0; i < keys.length; ++i) {
                    const k = keys[i]
                    r += this.currIndent + this.doString(k)
                    if (this.indent)
                        r += ": "
                    else
                        r += ":"
                    r += this.go(v[k])
                    if (i != keys.length - 1)
                        r += ","
                    if (this.indent)
                        r += "\n"
                }
                if (this.indent)
                    this.currIndent = this.currIndent.slice(this.indent)
                r += this.currIndent + "}"
                return r
            }
        }
    }

    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer Not supported; use null.
     * @param indent Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    export function stringify(value: any, replacer: any = null, indent: number = 0) {
        const ss = new Stringifier()
        ss.currIndent = ""
        indent |= 0
        if (indent < 0) indent = 0
        if (indent > 10) indent = 10
        ss.indentStep = ""
        ss.currIndent = ""
        ss.indent = indent
        while (indent-- > 0)
            ss.indentStep += " "
        return ss.go(value)
    }


    /**
     * Converts a JavaScript Object Notation (JSON) string into an object.
     * @param text A valid JSON string.
     */
    export function parse(s: string) {
        const p = new Parser()
        p.ptr = 0
        p.s = s
        const r = p.value()
        if (p.skipWS()) {
            p.error("excessive input")
        }
        if (p.errorMsg) {
            control.dmesg("Invalid JSON: " + p.errorMsg)
            return undefined
        }
        return r
    }
}

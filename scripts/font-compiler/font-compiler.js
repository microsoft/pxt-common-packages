let fs = require("fs")
let mode = 0
let out = ""
let prop = {}
let dataBuf = ""
let unicodeBuf = []
let currChar = 0
let currCharLine = 0
let currCharBuf = null
let glyph = {}
let allChars = {}
let charHash = {}
let charHashList = ""

function flushGlyph() {
    if (!currChar) return
    let g = glyph
    glyph = {}

    let ch = currChar

    let k = (100000 + ch).toString(10)
    if (allChars[k])
        return

    // exclude https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms
    if (0xff00 <= ch && ch <= 0xffef)
        return

    // exclude RTL languages - not supported in text printing
    if (0x0590 <= ch && ch <= 0x074f)
        return

    let hd = `\n* '${String.fromCharCode(ch)}' ${ch}\n`
    let out = ""

    let off = -3
    let p = [0, 1, 2, 3, 4]

    while (off < 0) {
        if (p.some(j => g[off + "," + j]))
            break
        off++
    }

    p = [0, 1, 2, 3, 4, 5, 6, 7]
    let offx = 3
    while (offx > 0) {
        if (p.some(i => g[(i + off) + "," + (offx + 4)]))
            break
        offx--
    }

    for (let i = 7; i >= 0; --i) {
        for (let j = 0; j < 5; ++j) {
            if (g[(i + off) + "," + (j + offx)])
                out += "# "
            else
                out += ". "
        }
        out += "\n"
    }

    /*
    // Identify characters sharing bitmaps - it turns out this only saves about 10%, so we avoid the complexity
    if (charHash[out]) {
        charHashList += ">" + hd.trim() + " = " + charHash[out] + "\n"
        allChars[k] = ""
        return
    }
    */

    charHash[out] = ch
    allChars[k] = hd + out
}

let lines = process.argv.slice(2).map(s => fs.readFileSync(s, "utf8")).join("\n").split(/\n\r?/)

for (let line of lines) {
    line = line.trim()
    let m = /^(\w+)([:=])\s*(\d+)/.exec(line)
    if (!mode && m && (m[1] == "charWidth" || m[1] == "charHeight")) {
        mode = m[2] == "=" ? 1 : 2
    }

    if (!mode && /^copyright = /.test(line))
        mode = 3;

    if (!line) continue

    if (m) {
        if (mode == 1) {
            out += `${m[1]}: ${m[3]},\n`
        } else {
            out += `${m[1]}=${m[3]}\n`
        }
        prop[m[1]] = parseInt(m[3])
    } else {
        if (mode == 1) {
            let w = (prop.charWidth + 7) >> 3
            let sz = w * prop.charHeight
            if (/^[\.# ]{2,}$/.test(line)) {
                line = line.replace(/ /g, "").replace(/\./g, "0").replace(/#/g, "1")
                let bytes = []
                line = line.slice(0, prop.charWidth)
                while (line.length > 0) {
                    let pref = line.slice(0, 8)
                    line = line.slice(8)
                    while (pref.length < 8) pref += "0"
                    bytes.push(parseInt(pref, 2))
                }
                currCharBuf.set(bytes, 2 + currCharLine * w)
                currCharLine++
            } else {
                m = /^\* ((\d+)|'(.)')/.exec(line)
                if (m) {
                    if (m[2]) currChar = parseInt(m[2])
                    else currChar = m[3].charCodeAt(0)
                    currCharLine = 0
                    unicodeBuf.push(currCharBuf = new Buffer(2 + sz))
                    currCharBuf.fill(0)
                    currCharBuf.writeUInt16LE(currChar, 0)
                } else {
                    console.error("Bad#: " + line)
                }
            }
        } else if (mode == 2) {
            if (/^[a-f0-9 ]{2,}$/.test(line)) {
                dataBuf += line.replace(/ /g, "")
            } else {
                console.error("Bad: " + line)
            }
        } else if (mode == 3) {
            m = /unicode = (....)/.exec(line)
            if (m) {
                flushGlyph()
                currChar = parseInt(m[1], 16)
            } else {
                m = /transform = \"\{([\-\d.,]+)\}\"/.exec(line)
                if (m) {
                    let nums = m[1].split(/,/).map(s => parseFloat(s))
                    let y = Math.round(nums[4] / Math.abs(nums[0]) / 1000)
                    let x = Math.round(nums[5] / Math.abs(nums[3]) / 1000)
                    let k = x + "," + y
                    glyph[k] = 1
                }
            }
        }
    }
}

if (mode == 3) {
    flushGlyph()
    let keys = Object.keys(allChars)
    keys.sort()
    out += "charWidth=5\ncharHeight=8\n"
    for (let k of keys) {
        out += allChars[k]
    }
    out += "\n" + charHashList
}

function fmt(bufs) {
    out += "hex`\n"
    let len = 0
    for (let p = 0; p < bufs.length; p++) {
        let s = bufs[p].toString("hex")
        out += s
        if (len + s.length > 100) {
            out += "\n"
            len = 0
        } else {
            out += " "
            len += s.length + 1
        }
        
    }
    out += "\n`,\n"
}

function showChar(buf, ptr, ch) {
    out += `\n* '${String.fromCharCode(ch)}' ${ch}\n`
    let w = (prop.charWidth + 7) >> 3
    for (let line = 0; line < prop.charHeight; ++line) {
        let p = ptr + w * line
        let mask = 0x80
        for (let col = 0; col < prop.charWidth; ++col) {
            if (mask == 0) p++;
            if (buf[p] & mask)
                out += "# "
            else
                out += ". "
            mask >>= 1
        }
        out += "\n"
    }
}

if (mode == 2) {
    let w = (prop.charWidth + 7) >> 3
    let sz = w * prop.charHeight
    let buf = new Buffer(dataBuf, "hex")
    for (let ptr = 0; ptr < buf.length; ptr += sz + 2) {
        showChar(buf, ptr + 2, buf.readUInt16LE(ptr))
    }
} else if (mode == 1) {
    unicodeBuf.sort((a, b) => a.readUInt16LE(0) - b.readUInt16LE(0))
    out += "data: "
    fmt(unicodeBuf)
}

console.log(out)

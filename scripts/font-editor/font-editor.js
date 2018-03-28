let fs = require("fs")
let mode = 0
let out = ""
let prop = {}
let baseDataBuf = ""
let dataBuf = ""
let fontBuf = null
let unicodeBuf = []
let currChar = 0
let currCharLine = 0
let currCharBuf = null
for (let line of fs.readFileSync(process.argv[2], "utf8").split(/\n/)) {
    line = line.trim()
    let m = /^(\w+)([:=])\s*(\d+)/.exec(line)
    if (!mode && m && (m[1] == "charWidth" || m[1] == "charHeight")) {
        mode = m[2] == "=" ? 1 : 2
    }

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
            if (!fontBuf) {
                fontBuf = new Buffer((127 - prop.firstChar) * sz)
                fontBuf.fill(0)
            }
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
                if (currCharBuf) {
                    currCharBuf.set(bytes, 2 + currCharLine * w)
                } else {
                    fontBuf.set(bytes, (currChar - prop.firstChar) * sz + currCharLine * w)
                }
                currCharLine++
            } else {
                m = /^\* ((\d+)|'(.)')/.exec(line)
                if (m) {
                    if (m[2]) currChar = parseInt(m[2])
                    else currChar = m[3].charCodeAt(0)
                    currCharLine = 0
                    if (currChar >= 128) {
                        unicodeBuf.push(currCharBuf = new Buffer(2 + sz))
                        currCharBuf.fill(0)
                        currCharBuf.writeInt16LE(currChar, 0)
                    } else {
                        currCharBuf = null
                    }
                } else {
                    console.error("Bad#: " + line)
                }
            }
        } else if (mode == 2) {
            if (/^[a-f0-9 ]{2,}$/.test(line)) {
                dataBuf += line.replace(/ /g, "")
            } else if (/uniData/.test(line)) {
                baseDataBuf = dataBuf
                dataBuf = ""
            } else {
                console.error("Bad: " + line)
            }
        }
    }
}

function fmt(buf) {
    out += "hex`\n"
    for (let p = 0; p < buf.length; p += 40) {
        out += buf.slice(p, p + 40).toString("hex") + "\n"
    }
    out += "`,\n"
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
    if (!baseDataBuf) {
        baseDataBuf = dataBuf
        dataBuf = ""
    }
    let buf = new Buffer(baseDataBuf, "hex")
    let w = (prop.charWidth + 7) >> 3
    let sz = w * prop.charHeight
    let ch = prop.firstChar
    for (let ptr = 0; ptr < buf.length; ptr += sz) {
        showChar(buf, ptr, ch++)
    }
    buf = new Buffer(dataBuf, "hex")
    for (let ptr = 0; ptr < buf.length; ptr += sz + 2) {
        showChar(buf, ptr + 2, buf.readUInt16LE(ptr))
    }
} else {
    out += "data: "
    fmt(fontBuf)
    unicodeBuf.sort((a, b) => a.readUInt16LE(0) - b.readUInt16LE(0))
    out += "uniData: "
    fmt(Buffer.concat(unicodeBuf))
}

console.log(out)
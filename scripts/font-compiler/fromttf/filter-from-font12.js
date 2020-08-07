const fs = require("fs")

function main() {
    const utf = fs.readFileSync(process.argv[2], "utf8")
    const f12 = fs.readFileSync(process.argv[3], "utf8")
    let code = 0
    const font = {}
    for (let ln of f12.split(/\n/)) {
        const m = /^\* '.' (\d+)/.exec(ln)
        if (m) {
            code = m[1]
            font[code] = ""
        }
        font[code] += ln + "\n"
    }
    for (let i = 0; i < utf.length; ++i) {
        const c = utf.charCodeAt(i)
        if (c < 255)
            continue
        console.log(font[c + ""].replace(/\n$/, ""))
    }
}

main()


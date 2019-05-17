const PNG = require("pngjs").PNG
const fs = require("fs")

const fnttxt = fs.readFileSync(process.argv[2], "utf8")
const lines = fnttxt.split(/\n/).map(parseLine)

function parseLine(l) {
    l = "cmd=" + l.trim()
    let r = {}
    l.replace(/(\w+)=(\S+)/g, (f, k, v) => {
        let vi = parseInt(v)
        if (!isNaN(vi)) v = vi
        r[k] = v
        return ""
    })
    return r
}

const chars = []
let rr = ""

function readPix(sheet, x, y) {
    return sheet.data[4 * (x + y * sheet.width)] != 0
}

function ones(l) {
    return l.replace(/[ \.]/g, "").length
}

function loadPage(id, sheet) {
    for (let line of lines) {
        if (line.cmd == "char" && line.page == id) {
            let code = line.id
            let r = "\n* '" + String.fromCharCode(code) + "' " + code + " U+" + code.toString(16) + "\n"
            let rows = []
            for (let y = 0; y < line.height; ++y) {
                let row = ""
                for (let x = 0; x < line.width; ++x) {
                    if (readPix(sheet, line.x + x, line.y + y))
                        row += "# "
                    else
                        row += ". "
                }

                if (y < 3 && rows.length == 0 && ones(row) == 0) {
                    // skip
                } else {
                    rows.push(row)
                }
            }

            while (rows.length > 12 && ones(rows[rows.length - 1]) == 0)
                rows.pop()
            while (rows.length > 12 && ones(rows[0]) == 0)
                rows.shift()

            // for accents at bottom, separated
            if (rows.length > 12 && ones(rows[rows.length - 2]) == 0)
                rows.splice(rows.length - 2, 1)
            // accent at top
            if (rows.length > 12 && ones(rows[1]) == 0)
                rows.splice(1, 1)
            // and bottom again
            if (rows.length > 12 && ones(rows[rows.length - 2]) == 0)
                rows.splice(rows.length - 2, 1)

            // cut where there's less set pixels
            while (rows.length > 12) {
                if (ones(rows[0]) >= ones(rows[rows.length - 1]))
                    rows.shift()
                else
                    rows.pop()
            }

            r += rows.join("\n") + "\n"
            chars[code] = r
            rr += r
        }
    }
}

for (let line of lines) {
    if (line.cmd == "page") {
        let fn = line.file.replace(/"/g, "")
        let sheet = PNG.sync.read(fs.readFileSync(fn))
        loadPage(line.id, sheet)
    }
}

rr = ""
for (let i = 0; i < chars.length; ++i) {
    if (chars[i])
        rr += chars[i]
}

fs.writeFileSync("font.txt", rr, "utf8")

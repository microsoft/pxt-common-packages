const PNG = require("pngjs").PNG
const fs = require("fs")

function processFile(filename) {
    const fnttxt = fs.readFileSync(filename, "utf8")
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

    return chars
}


const orderJP = fs.readFileSync("freq-jp.txt", "utf8")
const orderSC = fs.readFileSync("freq-sc.txt", "utf8")
const orderUNI = fs.readFileSync("freq-uni.txt", "utf8")

process.chdir("tmp")
const charsJP = processFile("shs-jp.fnt")
const charsSC = processFile("shs-sc.fnt")
const charsUNI = processFile("shs-tw.fnt")
process.chdir("..")

//const chars = processFile(process.argv[2])
//const prev = process.argv[3] ? processFile(process.argv[3]) : []
let rr = ""
for (let i = 0; i < charsUNI.length; ++i) {
    if (!charsUNI[i])
        continue
    let ch = String.fromCharCode(i)
    let jp = orderJP.indexOf(ch)
    let sc = orderSC.indexOf(ch)
    let chars = charsUNI
    if (jp >= 0) {
        if (sc >= 0 && sc <= jp)
            chars = charsSC
        else
            chars = charsJP
    } else if (sc >= 0) {
        chars = charsSC
    }
    rr += chars[i]
}

rr = `# This is based on Adobe Source Han Sans, see https://github.com/adobe-fonts/source-han-sans
charWidth=12
charHeight=12
jres=1
` + rr
fs.writeFileSync("font12.txt", rr, "utf8")

const fs = require("fs")

let s = ""
let k = 0
let chars = []
for (let l of fs.readFileSync("freqs", "utf8").split("\n")) {
    l.replace(/0x[a-f0-9]+/g, f => {
        let k = parseInt(f)
        if (!k) console.log(f)
        else if (k <= 0xffff) {
            chars[k] = 1
            s += String.fromCharCode(k)
        }
    })
}

//for (let i = 0; i < chars.length; ++i)
//    if (chars[i])
//        s += String.fromCharCode(i)

fs.writeFileSync("freq-uni.txt", s, "utf8")
fs.writeFileSync("fr.txt", s, "utf16le")

// Reverse order of bits in bytes in buffers

let fs = require("fs")

let lines = fs.readFileSync(process.argv[2], "utf8").split(/\n/)
let r = ""

function revbits(v) {
    v = (v & 0xf0) >> 4 | (v & 0x0f) << 4;
    v = (v & 0xcc) >> 2 | (v & 0x33) << 2;
    v = (v & 0xaa) >> 1 | (v & 0x55) << 1;
    return v;
}

for (let l of lines) {
    if (l.length > 20 && /^[a-f0-9 ]*$/i.test(l)) {
        l = l.replace(/[a-f0-9][a-f0-9]/ig, s => {
            let v = parseInt(s,16)
            return ("0" + revbits(v).toString(16)).slice(-2)
        })
    }
    r += l +"\n"
}

fs.writeFileSync(process.argv[2],r)
let i = 1
let f = 0.5
let plus = i + f
let minus = i - f

let r = Math.random()
let ri = Math.randomRange(5, 10)


function check(cond:boolean) { control.assert(cond, 108) }

check(Buffer.pack("<2h", [0x3412, 0x7856]).toHex() == "12345678")
check(Buffer.pack(">hh", [0x3412, 0x7856]).toHex() == "34127856")
check(Buffer.fromHex("F00d").toHex() == "f00d")
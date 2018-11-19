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

const fullKana =
    'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソ' +
    'ゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペ' +
    'ホボポマミムメモャヤュユョヨラリルレロワヲンーヮヰヱヵヶヴ' +
    'ヽヾ・「」。、'

const halfKana = ['ｧ', 'ｱ', 'ｨ', 'ｲ', 'ｩ', 'ｳ', 'ｪ', 'ｴ', 'ｫ', 'ｵ',
    'ｶ', 'ｶﾞ', 'ｷ', 'ｷﾞ', 'ｸ', 'ｸﾞ', 'ｹ', 'ｹﾞ', 'ｺ',
    'ｺﾞ', 'ｻ', 'ｻﾞ', 'ｼ', 'ｼﾞ', 'ｽ', 'ｽﾞ', 'ｾ', 'ｾﾞ',
    'ｿ', 'ｿﾞ', 'ﾀ', 'ﾀﾞ', 'ﾁ', 'ﾁﾞ', 'ｯ', 'ﾂ', 'ﾂﾞ',
    'ﾃ', 'ﾃﾞ', 'ﾄ', 'ﾄﾞ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾉ', 'ﾊ',
    'ﾊﾞ', 'ﾊﾟ', 'ﾋ', 'ﾋﾞ', 'ﾋﾟ', 'ﾌ', 'ﾌﾞ', 'ﾌﾟ', 'ﾍ',
    'ﾍﾞ', 'ﾍﾟ', 'ﾎ', 'ﾎﾞ', 'ﾎﾟ', 'ﾏ', 'ﾐ', 'ﾑ', 'ﾒ',
    'ﾓ', 'ｬ', 'ﾔ', 'ｭ', 'ﾕ', 'ｮ', 'ﾖ', 'ﾗ', 'ﾘ', 'ﾙ',
    'ﾚ', 'ﾛ', 'ﾜ', 'ｦ', 'ﾝ', 'ｰ',
    'ヮ', 'ヰ', 'ヱ', 'ヵ', 'ヶ', 'ｳﾞ', 'ヽ', 'ヾ', '･',
    '｢', '｣', '｡', '､'
]

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
    //if (0x0590 <= ch && ch <= 0x074f)
    //    return

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

const blocksSrc = `
U+0000 - U+007F	Basic Latin	128
U+0080 - U+00FF	Latin-1 Supplement	128
U+0100 - U+017F	Latin Extended-A	128
U+0180 - U+024F	Latin Extended-B	208
U+0250 - U+02AF	IPA Extensions	96
U+02B0 - U+02FF	Spacing Modifier Letters	80
U+0300 - U+036F	Combining Diacritical Marks	112
U+0370 - U+03FF	Greek and Coptic	135
U+0400 - U+04FF	Cyrillic	256
U+0500 - U+052F	Cyrillic Supplement	48
U+0530 - U+058F	Armenian	91
U+0590 - U+05FF	Hebrew	88
U+0600 - U+06FF	Arabic	255
U+0700 - U+074F	Syriac	77
U+0750 - U+077F	Arabic Supplement	48
U+0780 - U+07BF	Thaana	50
U+07C0 - U+07FF	NKo	62
U+0800 - U+083F	Samaritan	61
U+0840 - U+085F	Mandaic	29
U+0860 - U+086F	Syriac Supplement	11
U+08A0 - U+08FF	Arabic Extended-A	74
U+0900 - U+097F	Devanagari	128
U+0980 - U+09FF	Bengali	96
U+0A00 - U+0A7F	Gurmukhi	80
U+0A80 - U+0AFF	Gujarati	91
U+0B00 - U+0B7F	Oriya	90
U+0B80 - U+0BFF	Tamil	72
U+0C00 - U+0C7F	Telugu	97
U+0C80 - U+0CFF	Kannada	89
U+0D00 - U+0D7F	Malayalam	117
U+0D80 - U+0DFF	Sinhala	90
U+0E00 - U+0E7F	Thai	87
U+0E80 - U+0EFF	Lao	67
U+0F00 - U+0FFF	Tibetan	211
U+1000 - U+109F	Myanmar	160
U+10A0 - U+10FF	Georgian	88
U+1100 - U+11FF	Hangul Jamo	256
U+1200 - U+137F	Ethiopic	358
U+1380 - U+139F	Ethiopic Supplement	26
U+13A0 - U+13FF	Cherokee	92
U+1400 - U+167F	Unified Canadian Aboriginal Syllabics	640
U+1680 - U+169F	Ogham	29
U+16A0 - U+16FF	Runic	89
U+1700 - U+171F	Tagalog	20
U+1720 - U+173F	Hanunoo	23
U+1740 - U+175F	Buhid	20
U+1760 - U+177F	Tagbanwa	18
U+1780 - U+17FF	Khmer	114
U+1800 - U+18AF	Mongolian	157
U+18B0 - U+18FF	Unified Canadian Aboriginal Syllabics Extended	70
U+1900 - U+194F	Limbu	68
U+1950 - U+197F	Tai Le	35
U+1980 - U+19DF	New Tai Lue	83
U+19E0 - U+19FF	Khmer Symbols	32
U+1A00 - U+1A1F	Buginese	30
U+1A20 - U+1AAF	Tai Tham	127
U+1AB0 - U+1AFF	Combining Diacritical Marks Extended	15
U+1B00 - U+1B7F	Balinese	121
U+1B80 - U+1BBF	Sundanese	64
U+1BC0 - U+1BFF	Batak	56
U+1C00 - U+1C4F	Lepcha	74
U+1C50 - U+1C7F	Ol Chiki	48
U+1C80 - U+1C8F	Cyrillic Extended-C	9
U+1C90 - U+1CBF	Georgian Extended	46
U+1CC0 - U+1CCF	Sundanese Supplement	8
U+1CD0 - U+1CFF	Vedic Extensions	42
U+1D00 - U+1D7F	Phonetic Extensions	128
U+1D80 - U+1DBF	Phonetic Extensions Supplement	64
U+1DC0 - U+1DFF	Combining Diacritical Marks Supplement	63
U+1E00 - U+1EFF	Latin Extended Additional	256
U+1F00 - U+1FFF	Greek Extended	233
U+2000 - U+206F	General Punctuation	111
U+2070 - U+209F	Superscripts and Subscripts	42
U+20A0 - U+20CF	Currency Symbols	32
U+20D0 - U+20FF	Combining Diacritical Marks for Symbols	33
U+2100 - U+214F	Letterlike Symbols	80
U+2150 - U+218F	Number Forms	60
U+2190 - U+21FF	Arrows	112
U+2200 - U+22FF	Mathematical Operators	256
U+2300 - U+23FF	Miscellaneous Technical	256
U+2400 - U+243F	Control Pictures	39
U+2440 - U+245F	Optical Character Recognition	11
U+2460 - U+24FF	Enclosed Alphanumerics	160
U+2500 - U+257F	Box Drawing	128
U+2580 - U+259F	Block Elements	32
U+25A0 - U+25FF	Geometric Shapes	96
U+2600 - U+26FF	Miscellaneous Symbols	256
U+2700 - U+27BF	Dingbats	192
U+27C0 - U+27EF	Miscellaneous Mathematical Symbols-A	48
U+27F0 - U+27FF	Supplemental Arrows-A	16
U+2800 - U+28FF	Braille Patterns	256
U+2900 - U+297F	Supplemental Arrows-B	128
U+2980 - U+29FF	Miscellaneous Mathematical Symbols-B	128
U+2A00 - U+2AFF	Supplemental Mathematical Operators	256
U+2B00 - U+2BFF	Miscellaneous Symbols and Arrows	250
U+2C00 - U+2C5F	Glagolitic	94
U+2C60 - U+2C7F	Latin Extended-C	32
U+2C80 - U+2CFF	Coptic	123
U+2D00 - U+2D2F	Georgian Supplement	40
U+2D30 - U+2D7F	Tifinagh	59
U+2D80 - U+2DDF	Ethiopic Extended	79
U+2DE0 - U+2DFF	Cyrillic Extended-A	32
U+2E00 - U+2E7F	Supplemental Punctuation	79
U+2E80 - U+2EFF	CJK Radicals Supplement	115
U+2F00 - U+2FDF	Kangxi Radicals	214
U+2FF0 - U+2FFF	Ideographic Description Characters	12
U+3000 - U+303F	CJK Symbols and Punctuation	64
U+3040 - U+309F	Hiragana	93
U+30A0 - U+30FF	Katakana	96
U+3100 - U+312F	Bopomofo	43
U+3130 - U+318F	Hangul Compatibility Jamo	94
U+3190 - U+319F	Kanbun	16
U+31A0 - U+31BF	Bopomofo Extended	27
U+31C0 - U+31EF	CJK Strokes	36
U+31F0 - U+31FF	Katakana Phonetic Extensions	16
U+3200 - U+32FF	Enclosed CJK Letters and Months	254
U+3300 - U+33FF	CJK Compatibility	256
U+3400 - U+4DBF	CJK Unified Ideographs Extension A	6,582
U+4DC0 - U+4DFF	Yijing Hexagram Symbols	64
U+4E00 - U+9FFF	CJK Unified Ideographs	20,976
U+A000 - U+A48F	Yi Syllables	1,165
U+A490 - U+A4CF	Yi Radicals	55
U+A4D0 - U+A4FF	Lisu	48
U+A500 - U+A63F	Vai	300
U+A640 - U+A69F	Cyrillic Extended-B	96
U+A6A0 - U+A6FF	Bamum	88
U+A700 - U+A71F	Modifier Tone Letters	32
U+A720 - U+A7FF	Latin Extended-D	163
U+A800 - U+A82F	Syloti Nagri	44
U+A830 - U+A83F	Common Indic Number Forms	10
U+A840 - U+A87F	Phags-pa	56
U+A880 - U+A8DF	Saurashtra	82
U+A8E0 - U+A8FF	Devanagari Extended	32
U+A900 - U+A92F	Kayah Li	48
U+A930 - U+A95F	Rejang	37
U+A960 - U+A97F	Hangul Jamo Extended-A	29
U+A980 - U+A9DF	Javanese	91
U+A9E0 - U+A9FF	Myanmar Extended-B	31
U+AA00 - U+AA5F	Cham	83
U+AA60 - U+AA7F	Myanmar Extended-A	32
U+AA80 - U+AADF	Tai Viet	72
U+AAE0 - U+AAFF	Meetei Mayek Extensions	23
U+AB00 - U+AB2F	Ethiopic Extended-A	32
U+AB30 - U+AB6F	Latin Extended-E	54
U+AB70 - U+ABBF	Cherokee Supplement	80
U+ABC0 - U+ABFF	Meetei Mayek	56
U+AC00 - U+D7AF	Hangul Syllables	11,172
U+D7B0 - U+D7FF	Hangul Jamo Extended-B	72
U+D800 - U+DB7F	High Surrogates	0
U+DB80 - U+DBFF	High Private Use Surrogates	0
U+DC00 - U+DFFF	Low Surrogates	0
U+E000 - U+F8FF	Private Use Area	0
U+F900 - U+FAFF	CJK Compatibility Ideographs	472
U+FB00 - U+FB4F	Alphabetic Presentation Forms	58
U+FB50 - U+FDFF	Arabic Presentation Forms-A	611
U+FE00 - U+FE0F	Variation Selectors	16
U+FE10 - U+FE1F	Vertical Forms	10
U+FE20 - U+FE2F	Combining Half Marks	16
U+FE30 - U+FE4F	CJK Compatibility Forms	32
U+FE50 - U+FE6F	Small Form Variants	26
U+FE70 - U+FEFF	Arabic Presentation Forms-B	141
U+FF00 - U+FFEF	Halfwidth and Fullwidth Forms	225
U+FFF0 - U+FFFF	Specials	5
`

let blocks = null

function shouldSkip(ch) {
    if (!blocks) {
        blocks = []
        for (let ll of blocksSrc.split(/\n/)) {
            let m = /U\+([A-F0-9]{4}) - U\+([A-F0-9]{4})\s+(.*)/.exec(ll)
            if (m) {
                let k = parseInt(m[1], 16)
                let ee = parseInt(m[2], 16)
                let desc = m[3]
                while (k <= ee) {
                    blocks[k++] = desc
                }
            }
        }
    }

    if (/extended|supplement/.test(blocks[ch]) && !/latin/.test(blocks[ch]))
        return true

    if (/private|Compatibility|Presentation|Runic|IPA Extensions/i.test(blocks[ch]))
        return true

    // control chars
    if (ch < 32) return true
    if (128 <= ch && ch <= 159) return true
    if (0xe000 <= ch && ch <= 0xf8ff) return true // private use
    if (0xf900 <= ch && ch <= 0xFEFF) return true // presentation forms
    if (0x300 <= ch && ch <= 0x36f) return true // combining
    if (ch >= 0xfff0) return true // specials

    if (0x2000 <= ch && ch <= 0x2bff) {
        if (0x20A0 <= ch && ch <= 0x20CF)
            return false // currency
        if (0x2190 <= ch && ch <= 0x2199)
            return false // a few arrows
        return true
    }

    return false
}

let lines = process.argv.slice(2).map(s => fs.readFileSync(s, "utf8")).join("\n").split(/\n\r?/)
let bmp = ""
let charIdx = 0
let compress = false

for (let line of lines) {
    line = line.trim()

    if (!mode && /^STARTFONT /.test(line)) {
        mode = 5
    }

    let hexM = /^([0-9A-F]{4}):([0-9A-F]{16,})$/.exec(line)

    if (!mode && hexM) {
        mode = 4;
        prop.charWidth = 8
        prop.charHeight = 8
    }

    let m = /^(\w+)([:=])\s*(\d+)/.exec(line)
    if (!mode && m && (m[1] == "charWidth" || m[1] == "charHeight")) {
        mode = m[2] == "=" ? 1 : 2
    }

    if (!mode && /^copyright = /.test(line))
        mode = 3;

    if (!line) continue

    if (m && mode != 4) {
        if (mode == 1) {
            out += `${m[1]}: ${m[3]},\n`
        } else {
            out += `${m[1]}=${m[3]}\n`
        }
        prop[m[1]] = parseInt(m[3])
    } else {
        if (mode == 1) {
            let h = (prop.charHeight + 7) >> 3
            let sz = h * prop.charWidth
            if (/^[\.# ]{2,}$/.test(line)) {
                line = line.replace(/ /g, "")

                for (let i = 0; i < prop.charWidth; ++i) {
                    if (line.charAt(i) == '#') {
                        let idx = 2 + i * h + (currCharLine >> 3)
                        currCharBuf[idx] |= 0x01 << (currCharLine & 7)
                    }
                }

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
        } else if (mode == 4) {
            if (!hexM) {
                console.log("invalid hex: " + line)
                continue
            }
            let ch = parseInt(hexM[1], 16)
            let b = new Buffer(hexM[2], "hex")

            if (shouldSkip(ch))
                continue

            if (0x1400 <= ch && ch <= 0x1fff)
                continue
            if (0x2500 <= ch && ch <= 0xff00)
                continue

            /* This doesn't work so well.
            let idx = halfKana.indexOf(String.fromCharCode(ch))
            if (idx >= 0)
                ch = fullKana.charCodeAt(idx)
            */

            showChar(b, 0, ch)
        } else if (mode == 5) {
            if (!prop.charWidth) {
                let m = /BBX (\d+) (\d+)/.exec(line)
                if (m) {
                    prop.charWidth = parseInt(m[1])
                    prop.charHeight = parseInt(m[2])
                    if (prop.charHeight == 9) compress = true
                    if (compress) prop.charHeight--
                    out += `charWidth=${prop.charWidth}\ncharHeight=${prop.charHeight}\n\n`
                }
            }
            m = /ENCODING (\d+)/.exec(line)
            if (m)
                charIdx = parseInt(m[1])
            m = /^([0-9A-F]{2})$/.exec(line)
            if (m)
                bmp += m[1]
            if (line == "ENDCHAR") {
                if (shouldSkip(charIdx))
                    charIdx = 0
                if (charIdx) {
                    let h = prop.charHeight
                    if (compress) {
                        if (bmp.endsWith("00")) bmp = bmp.slice(0, bmp.length - 2)
                        else if (bmp.startsWith("00")) bmp = bmp.slice(2)
                        else {
                            if (false) {
                                out += "ERROR\n"
                                h++
                            } else {
                                bmp = bmp.slice(0, bmp.length - 2) // oh well...
                            }
                        }
                    }
                    showChar(new Buffer(bmp, "hex"), 0, charIdx, h)
                }
                bmp = ""
                charIdx = 0
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

function showChar(buf, ptr, ch, hh) {
    if (!hh) hh = prop.charHeight
    out += `\n* '${String.fromCharCode(ch)}' ${ch} U+${("000" + ch.toString(16)).slice(-4)}\n`
    let w = (prop.charWidth + 7) >> 3
    for (let line = 0; line < hh; ++line) {
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
namespace image {

    export interface Font {
        charWidth: number;
        charHeight: number;
        data: Buffer;
        doubledCache?: Font;
    }

    //% whenUsed
    export const font8: Font = {
        charWidth: 8,
        charHeight: 8,
        // source https://github.com/dhepper/font8x8
        data: hex`
20000000000000000000 2100183c3c1818001800 22006c6c000000000000 23006c6cfe6cfe6c6c00 2400307cc0780cf83000
250000c6cc183066c600 2600386c3876dccc7600 27006060c00000000000 28001830606060301800 29006030181818306000
2a0000663cff3c660000 2b00003030fc30300000 2c000000000000303060 2d00000000fc00000000 2e000000000000303000
2f00060c183060c08000 30007cc6cedef6e67c00 3100307030303030fc00 320078cc0c3860ccfc00 330078cc0c380ccc7800
34001c3c6cccfe0c1e00 3500fcc0f80c0ccc7800 36003860c0f8cccc7800 3700fccc0c1830303000 380078cccc78cccc7800
390078cccc7c0c187000 3a000030300000303000 3b000030300000303060 3c00183060c060301800 3d000000fc0000fc0000
3e006030180c18306000 3f0078cc0c1830003000 40007cc6dededec07800 41003078ccccfccccc00 4200fc66667c6666fc00
43003c66c0c0c0663c00 4400f86c6666666cf800 4500fe6268786862fe00 4600fe6268786860f000 47003c66c0c0ce663e00
4800ccccccfccccccc00 49007830303030307800 4a001e0c0c0ccccc7800 4b00e6666c786c66e600 4c00f06060606266fe00
4d00c6eefefed6c6c600 4e00c6e6f6decec6c600 4f00386cc6c6c66c3800 5000fc66667c6060f000 510078ccccccdc781c00
5200fc66667c6c66e600 530078cce0701ccc7800 5400fcb4303030307800 5500ccccccccccccfc00 5600cccccccccc783000
5700c6c6c6d6feeec600 5800c6c66c38386cc600 5900cccccc7830307800 5a00fec68c183266fe00 5b007860606060607800
5c00c06030180c060200 5d007818181818187800 5e0010386cc600000000 5f0000000000000000ff 60003030180000000000
61000000780c7ccc7600 6200e060607c6666dc00 6300000078ccc0cc7800 64001c0c0c7ccccc7600 6500000078ccfcc07800
6600386c60f06060f000 6700000076cccc7c0cf8 6800e0606c766666e600 69003000703030307800 6a000c000c0c0ccccc78
6b00e060666c786ce600 6c007030303030307800 6d000000ccfefed6c600 6e000000f8cccccccc00 6f00000078cccccc7800
70000000dc66667c60f0 7100000076cccc7c0c1e 72000000dc766660f000 730000007cc0780cf800 740010307c3030341800
75000000cccccccc7600 76000000cccccc783000 77000000c6d6fefe6c00 78000000c66c386cc600 79000000cccccc7c0cf8
7a000000fc983064fc00 7b001c3030e030301c00 7c001818180018181800 7d00e030301c3030e000 7e0076dc000000000000
7f000000000000000000
`
    }

    export function doubledFont(f: Font): Font {
        if (f.doubledCache) return f.doubledCache
        let byteWidth = (f.charWidth + 7) >> 3
        let sz = f.charHeight * byteWidth
        let numChars = f.data.length / (sz + 2)
        let newByteWidth = ((f.charWidth * 2) + 7) >> 3
        let nsz = f.charHeight * 2 * newByteWidth
        let data = control.createBuffer((nsz + 2) * numChars)
        let tmp = control.createBuffer(3 + sz)
        tmp[0] = 0xf1
        tmp[1] = f.charWidth
        tmp[2] = f.charHeight
        let dst = 0
        for (let i = 0; i < f.data.length; i += 2 + sz) {
            tmp.write(3, f.data.slice(i + 2, sz))
            let dbl = image.doubledIcon(tmp).slice(3)
            data[dst] = f.data[i]
            data[dst + 1] = f.data[i + 1]
            data.write(dst + 2, dbl)
            dst += 2 + dbl.length
        }
        f.doubledCache = {
            charWidth: f.charWidth * 2,
            charHeight: f.charHeight * 2,
            data: data
        }
        return f.doubledCache
    }

    //% whenUsed
    export const font5: Font = {
        charWidth: 6,
        charHeight: 5,
        // source https://github.com/lancaster-university/microbit-dal/blob/master/source/core/MicroBitFont.cpp
        data: hex`
20000000000000 21004040400040 22005050000000 230050f850f850 240070c8709870 2500c890204898 26006090609068
27004040000000 28002040404020 29004020202040 2a000050205000 2b000020702000 2c000000002040 2d000000700000
2e000000004000 2f000810204080 30006090909060 31002060202070 3200e0106080f0 3300f010209060 3400305090f810
3500f880f008f0 36001020708870 3700f810204080 38007088708870 39007088702040 3a000040004000 3b000020002040
3c001020402010 3d000070007000 3e004020102040 3f007088300020 40007088a89860 41006090f09090 4200e090e090e0
43007080808070 4400e0909090e0 4500f080e080f0 4600f080e08080 47007080988870 48009090f09090 4900e0404040e0
4a00f810109060 4b0090a0c0a090 4c0080808080f0 4d0088d8a88888 4e0088c8a89888 4f006090909060 5000e090e08080
51006090906030 5200e090e09088 530070806010e0 5400f820202020 55009090909060 56008888885020 57008888a8d888
58009090609090 59008850202020 5a00f0204080f0 5b007040404070 5c008040201008 5d007010101070 5e002050000000
5f0000000000f8 60004020000000 61000070909078 62008080e090e0 63000070808070 64001010709070 65006090e08070
66003040e04040 67007090701060 68008080e09090 69004000404040 6a001000101060 6b0080a0c0a090 6c004040404030
6d0000d8a88888 6e0000e0909090 6f000060909060 700000e090e080 71000070907010 72000070808080 730000304020c0
74004040704038 75000090909078 76000088885020 7700008888a8d8 78000090606090 790000885020c0 7a0000f02040f0
7b003020602030 7c004040404040 7d00c0406040c0 7e000000601800 d3003070888870 f3003060909060 04016090f09018
05017090907830 06013078808078 07013070808070 1801f0e080f030 19016090e0b070 410180a0c080f0 420140506040b0
4301a8c8a89888 440160e0909090 5a0130384020c0 5b0130304020c0 790130f02040f0 7a0130f02040f0 7b0160f02040f0
7c0160f02040f0
`,
    }
}

interface Image {
    //% helper=imagePrint
    print(text: string, x: number, y: number, color?: number, font?: image.Font): void;

    //% helper=imagePrintCenter
    printCenter(text: string, y: number, color?: number, font?: image.Font): void;
}

namespace helpers {
    export function imagePrintCenter(img: Image, text: string, y: number, color?: number, font?: image.Font) {
        if (!font) font = image.font5
        let w = text.length * font.charWidth
        let x = (screen.width - w) / 2
        imagePrint(img, text, x, y, color, font)
    }

    export function imagePrint(img: Image, text: string, x: number, y: number, color?: number, font?: image.Font) {
        x |= 0
        y |= 0
        if (!font) font = image.font5
        if (!color) color = 1
        let x0 = x
        let cp = 0
        let byteWidth = (font.charWidth + 7) >> 3
        let charSize = byteWidth * font.charHeight
        let imgBuf = control.createBuffer(3 + charSize)
        let dataSize = 2 + charSize
        let fontdata = font.data
        let lastchar = Math.idiv(fontdata.length, dataSize) - 1
        imgBuf[0] = 0xf1
        imgBuf[1] = font.charWidth
        imgBuf[2] = font.charHeight
        while (cp < text.length) {
            let ch = text.charCodeAt(cp++)
            if (ch == 10) {
                y += font.charHeight + 2
                x = x0
            }

            if (ch < 32)
                continue // skip control chars

            // decompose Korean characters
            let arr = [ch]
            if (44032 <= ch && ch <= 55203) {
                ch -= 44032
                arr = [
                    Math.idiv(ch, 588) + 0x1100,
                    (Math.idiv(ch, 28) % 21) + 0x1161,
                ]
                ch %= 28
                if (ch)
                    arr.push(ch % 28 + 0x11a7)
            }

            for (let cc of arr) {
                let l = 0
                let r = lastchar
                let off = 0 // this should be a space (0x0020)
                let guess = (ch - 32) * dataSize
                if (fontdata.getNumber(NumberFormat.UInt16LE, guess) == cc)
                    off = guess
                else {
                    while (l <= r) {
                        let m = l + ((r - l) >> 1);
                        let v = fontdata.getNumber(NumberFormat.UInt16LE, m * dataSize)
                        if (v == cc) {
                            off = m * dataSize
                            break
                        }
                        if (v < cc)
                            l = m + 1
                        else
                            r = m - 1
                    }
                }

                imgBuf.write(3, fontdata.slice(off + 2, charSize))
                img.drawIcon(imgBuf, x, y, color)
                x += font.charWidth
            }
        }
    }
}

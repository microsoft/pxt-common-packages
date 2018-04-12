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
20000000000000000000 2100000060fafa600000 220000c0c000c0c00000 230028fefe28fefe2800 24002474d6d65c480000
250062660c1830664600 26000c5ef2baec5e1200 270020e0c00000000000 280000387cc682000000 29000082c67c38000000
2a0010547c38387c5410 2b0010107c7c10100000 2c000001070600000000 2d001010101010100000 2e000000060600000000
2f00060c183060c08000 30007cfe8e9ab2fe7c00 31000242fefe02020000 320046ce9a92f6660000 330044c69292fe6c0000
3400183868cafefe0a00 3500e4e6a2a2be9c0000 36003c7ed2929e0c0000 3700c0c08e9ef0e00000 38006cfe9292fe6c0000
390060f29296fc780000 3a000000666600000000 3b000001676600000000 3c0010386cc682000000 3d002424242424240000
3e000082c66c38100000 3f0040c08a9af0600000 40007cfe82babaf87800 41003e7ec8c87e3e0000 420082fefe9292fe6c00
4300387cc68282c64400 440082fefe82c67c3800 450082fefe92ba82c600 460082fefe92b880c000 4700387cc6828ace4e00
4800fefe1010fefe0000 49000082fefe82000000 4a000c0e0282fefc8000 4b0082fefe1038eec600 4c0082fefe8202060e00
4d00fefe703870fefe00 4e00fefe603018fefe00 4f00387cc682c67c3800 500082fefe9290f06000 510078fc848efe7a0000
520082fefe9098fe6600 530064f6b29ace4c0000 5400c082fefe82c00000 5500fefe0202fefe0000 5600f8fc0606fcf80000
5700fefe0c180cfefe00 5800c2e63c183ce6c200 5900e0f21e1ef2e00000 5a00e2c68e9ab2e6ce00 5b0000fefe8282000000
5c0080c06030180c0600 5d00008282fefe000000 5e00103060c060301000 5f000101010101010101 60000000c0e020000000
6100042e2a2a3c1e0200 620082fefc12121e0c00 63001c3e222236140000 64000c1e1292fcfe0200 65001c3e2a2a3a180000
6600127efe92c0400000 6700193d25251f3e2000 680082fefe10203e1e00 69000022bebe02000000 6a0006070101bfbe0000
6b0082fefe081c362200 6c000082fefe02000000 6d003e3e181c383e1e00 6e003e3e20203e1e0000 6f001c3e22223e1c0000
7000213f1f25243c1800 7100183c24251f3f2100 7200223e1e3220381800 7300123a2a2a2e240000 740000207cfe22240000
75003c3e02023c3e0200 7600383c06063c380000 77003c3e0e1c0e3e3c00 780022361c081c362200 7900393d05053f3e0000
7a0032262e3a32260000 7b0010107cee82820000 7c00000000eeee000000 7d008282ee7c10100000 7e0040c080c040c08000
7f000000000000000000
`
    }

    export function doubledFont(f: Font): Font {
        if (f.doubledCache) return f.doubledCache
        let byteHeight = (f.charHeight + 7) >> 3
        let sz = f.charWidth * byteHeight
        let numChars = f.data.length / (sz + 2)
        let newByteHeight = ((f.charHeight * 2) + 7) >> 3
        let nsz = f.charWidth * 2 * newByteHeight
        let data = control.createBuffer((nsz + 2) * numChars)
        let tmp = control.createBuffer(4 + sz)
        tmp[0] = 0xe1
        tmp[1] = f.charWidth
        tmp[2] = f.charHeight
        let dst = 0
        for (let i = 0; i < f.data.length; i += 2 + sz) {
            tmp.write(4, f.data.slice(i + 2, sz))
            let dbl = image.doubledIcon(tmp).slice(4)
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
2000000000000000 210000e800000000 220000c000c00000 230050f850f85000 240050e8a8b85000 2500c89020489800
260050a8a8500800 270000c000000000 2800007088000000 2900008870000000 2a00005020500000 2b00002070200000
2c00000810000000 2d00002020200000 2e00001000000000 2f00081020408000 3000708888700000 31000048f8080000
320098a8a8480000 33009088a8d00000 3400305090f81000 3500e8a8a8a89000 3600102868a81000 37008890a0c08000
380050a8a8a85000 390040a8b0a04000 3a00005000000000 3b00000850000000 3c00002050880000 3d00005050500000
3e00008850200000 3f004080a8a04000 40007088a8907000 410078a0a0780000 4200f8a8a8500000 4300708888880000
4400f88888700000 4500f8a8a8880000 4600f8a0a0800000 4700708888a83000 4800f82020f80000 490088f888000000
4a00908888f08000 4b00f82050880000 4c00f80808080000 4d00f8402040f800 4e00f8402010f800 4f00708888700000
5000f8a0a0400000 5100609098680000 5200f8a0a0500800 530048a8a8900000 54008080f8808000 5500f00808f00000
5600e0100810e000 5700f8102010f800 5800d82020d80000 5900804038408000 5a0098a8c8880000 5b0000f888880000
5c00804020100800 5d00008888f80000 5e00004080400000 5f00080808080800 6000008040000000 6100304848780800
6200f82828100000 6300304848480000 6400102828f80000 650070a8a8480000 66002078a0800000 670040a8a8f00000
6800f82020180000 690000b800000000 6a00000808b00000 6b00f82050080000 6c0000f008080000 6d00784020407800
6e00784040380000 6f00304848300000 7000785050200000 7100205050780000 7200384040400000 7300082850400000
740000f028280800 7500700808780800 7600601008106000 7700780810087800 7800483030480000 7900482810204000
7a00485868480000 7b000020f8880000 7c0000f800000000 7d0088f820000000 7e00002020101000 d3003048c8c83000
f3003048c8b00000 040170a0a0780800 0501609098f81000 06013048c8c84800 07013048c8c80000 1801f0d0d8980000
190170a8b8580000 4101f82848080000 420108f028480000 4301f840a010f800 440178c0c0380000 5a010828d0c04000
5b010828d0c00000 79014858e8c80000 7a014858e8c80000 7b0148d8e8480000 7c0148d8e8480000
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
        let byteHeight = (font.charHeight + 7) >> 3
        let charSize = byteHeight * font.charWidth
        let imgBuf = control.createBuffer(4 + charSize)
        let dataSize = 2 + charSize
        let fontdata = font.data
        let lastchar = Math.idiv(fontdata.length, dataSize) - 1
        imgBuf[0] = 0xe1
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

                imgBuf.write(4, fontdata.slice(off + 2, charSize))
                img.drawIcon(imgBuf, x, y, color)
                x += font.charWidth
            }
        }
    }
}

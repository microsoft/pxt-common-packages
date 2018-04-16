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
20000000000000000000 21000000065f5f060000 22000003030003030000 2300147f7f147f7f1400 2400242e6b6b3a120000
2500466630180c666200 2600307a4f5d377a4800 27000407030000000000 2800001c3e6341000000 29000041633e1c000000
2a00082a3e1c1c3e2a08 2b0008083e3e08080000 2c000080e06000000000 2d000808080808080000 2e000000606000000000
2f006030180c06030100 30003e7f71594d7f3e00 310040427f7f40400000 3200627359496f660000 3300226349497f360000
3400181c16537f7f5000 3500276745457d390000 36003c7e4b4979300000 3700030371790f070000 3800367f49497f360000
3900064f49693f1e0000 3a000000666600000000 3b000080e66600000000 3c00081c366341000000 3d002424242424240000
3e00004163361c080000 3f00020351590f060000 40003e7f415d5d1f1e00 41007c7e13137e7c0000 4200417f7f49497f3600
43001c3e634141632200 4400417f7f41633e1c00 4500417f7f495d416300 4600417f7f491d010300 47001c3e634151737200
48007f7f08087f7f0000 490000417f7f41000000 4a00307040417f3f0100 4b00417f7f081c776300 4c00417f7f4140607000
4d007f7f0e1c0e7f7f00 4e007f7f060c187f7f00 4f001c3e6341633e1c00 5000417f7f49090f0600 51001e3f21717f5e0000
5200417f7f09197f6600 5300266f4d5973320000 540003417f7f41030000 55007f7f40407f7f0000 56001f3f60603f1f0000
57007f7f3018307f7f00 580043673c183c674300 5900074f78784f070000 5a00476371594d677300 5b00007f7f4141000000
5c000103060c18306000 5d000041417f7f000000 5e00080c0603060c0800 5f008080808080808080 60000000030704000000
6100207454543c784000 6200417f3f4848783000 6300387c44446c280000 6400307848493f7f4000 6500387c54545c180000
6600487e7f4903020000 670098bca4a4f87c0400 6800417f7f08047c7800 690000447d7d40000000 6a0060e08080fd7d0000
6b00417f7f10386c4400 6c0000417f7f40000000 6d007c7c18381c7c7800 6e007c7c04047c780000 6f00387c44447c380000
700084fcf8a4243c1800 7100183c24a4f8fc8400 7200447c784c041c1800 7300485c545474240000 740000043e7f44240000
75003c7c40403c7c4000 76001c3c60603c1c0000 77003c7c7038707c3c00 7800446c3810386c4400 79009cbca0a0fc7c0000
7a004c64745c4c640000 7b0008083e7741410000 7c000000007777000000 7d004141773e08080000 7e000203010302030100
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
2000000000000000 2100001700000000 2200000300030000 23000a1f0a1f0a00 24000a17151d0a00 2500130904121900
26000a15150a1000 2700000300000000 2800000e11000000 290000110e000000 2a00000a040a0000 2b0000040e040000
2c00001008000000 2d00000404040000 2e00000800000000 2f00100804020100 30000e11110e0000 310000121f100000
3200191515120000 33000911150b0000 34000c0a091f0800 3500171515150900 3600081416150800 3700110905030100
38000a1515150a00 390002150d050200 3a00000a00000000 3b0000100a000000 3c0000040a110000 3d00000a0a0a0000
3e0000110a040000 3f00020115050200 40000e1115090e00 41001e05051e0000 42001f15150a0000 43000e1111110000
44001f11110e0000 45001f1515110000 46001f0505010000 47000e1111150c00 48001f04041f0000 4900111f11000000
4a000911110f0100 4b001f040a110000 4c001f1010100000 4d001f0204021f00 4e001f0204081f00 4f000e11110e0000
50001f0505020000 5100060919160000 52001f05050a1000 5300121515090000 540001011f010100 55000f10100f0000
5600070810080700 57001f0804081f00 58001b04041b0000 590001021c020100 5a00191513110000 5b00001f11110000
5c00010204081000 5d000011111f0000 5e00000201020000 5f00101010101000 6000000102000000 61000c12121e1000
62001f1414080000 63000c1212120000 64000814141f0000 65000e1515120000 6600041e05010000 67000215150f0000
68001f0404180000 6900001d00000000 6a000010100d0000 6b001f040a100000 6c00000f10100000 6d001e0204021e00
6e001e02021c0000 6f000c12120c0000 70001e0a0a040000 7100040a0a1e0000 72001c0202020000 730010140a020000
7400000f14141000 75000e10101e1000 7600060810080600 77001e1008101e00 7800120c0c120000 7900121408040200
7a00121a16120000 7b0000041f110000 7c00001f00000000 7d00111f04000000 7e00000404080800 d3000c1213130c00
f3000c12130d0000 04010e05051e1000 05010609191f0800 06010c1213131200 07010c1213130000 18010f0b1b190000
19010e151d1a0000 41011f1412100000 4201100f14120000 43011f0205081f00 44011e03031c0000 5a0110140b030200
5b0110140b030000 7901121a17130000 7a01121a17130000 7b01121b17120000 7c01121b17120000`,
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

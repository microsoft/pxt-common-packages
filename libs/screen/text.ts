namespace image {

    export interface Font {
        charWidth: number;
        charHeight: number;
        firstChar: number;
        data: Buffer;
        doubledCache?: Font;
    }

    //% whenUsed
    export const defaultFont: Font = {
        charWidth: 8,
        charHeight: 8,
        firstChar: 32,
        // source https://github.com/dhepper/font8x8
        data: hex`
0000000000000000 183c3c1818001800 6c6c000000000000 6c6cfe6cfe6c6c00 307cc0780cf83000 00c6cc183066c600
386c3876dccc7600 6060c00000000000 1830606060301800 6030181818306000 00663cff3c660000 003030fc30300000
0000000000303060 000000fc00000000 0000000000303000 060c183060c08000 7cc6cedef6e67c00 307030303030fc00
78cc0c3860ccfc00 78cc0c380ccc7800 1c3c6cccfe0c1e00 fcc0f80c0ccc7800 3860c0f8cccc7800 fccc0c1830303000
78cccc78cccc7800 78cccc7c0c187000 0030300000303000 0030300000303060 183060c060301800 0000fc0000fc0000
6030180c18306000 78cc0c1830003000 7cc6dededec07800 3078ccccfccccc00 fc66667c6666fc00 3c66c0c0c0663c00
f86c6666666cf800 fe6268786862fe00 fe6268786860f000 3c66c0c0ce663e00 ccccccfccccccc00 7830303030307800
1e0c0c0ccccc7800 e6666c786c66e600 f06060606266fe00 c6eefefed6c6c600 c6e6f6decec6c600 386cc6c6c66c3800
fc66667c6060f000 78ccccccdc781c00 fc66667c6c66e600 78cce0701ccc7800 fcb4303030307800 ccccccccccccfc00
cccccccccc783000 c6c6c6d6feeec600 c6c66c38386cc600 cccccc7830307800 fec68c183266fe00 7860606060607800
c06030180c060200 7818181818187800 10386cc600000000 00000000000000ff 3030180000000000 0000780c7ccc7600
e060607c6666dc00 000078ccc0cc7800 1c0c0c7ccccc7600 000078ccfcc07800 386c60f06060f000 000076cccc7c0cf8
e0606c766666e600 3000703030307800 0c000c0c0ccccc78 e060666c786ce600 7030303030307800 0000ccfefed6c600
0000f8cccccccc00 000078cccccc7800 0000dc66667c60f0 000076cccc7c0c1e 0000dc766660f000 00007cc0780cf800
10307c3030341800 0000cccccccc7600 0000cccccc783000 0000c6d6fefe6c00 0000c66c386cc600 0000cccccc7c0cf8
0000fc983064fc00 1c3030e030301c00 1818180018181800 e030301c3030e000 76dc000000000000 0000000000000000
`
    }

    export function doubledFont(f: Font): Font {
        if (f.doubledCache) return f.doubledCache
        let byteWidth = (f.charWidth + 7) >> 3
        let lines = f.data.length / byteWidth
        let newByteWidth = ((f.charWidth * 2) + 7) >> 3
        let data = control.createBuffer(lines * newByteWidth * 2)
        let sz = f.charHeight * byteWidth
        let tmp = control.createBuffer(3 + sz)
        tmp[0] = 0xf1
        tmp[1] = f.charWidth
        tmp[2] = f.charHeight
        let dst = 0
        let img = image.ofBuffer(tmp)
        for (let i = 0; i < f.data.length; i += sz) {
            tmp.write(3, f.data.slice(i, sz))
            let dbl = img.doubled().cloneAsBuffer().slice(3)
            data.write(dst, dbl)
            dst += dbl.length
        }
        f.doubledCache = {
            charWidth: f.charWidth * 2,
            charHeight: f.charHeight * 2,
            firstChar: f.firstChar,
            data: data
        }
        return f.doubledCache
    }

    //% whenUsed
    export const codalFont: Font = {
        charWidth: 6,
        charHeight: 5,
        firstChar: 32,
        // source https://github.com/lancaster-university/microbit-dal/blob/master/source/core/MicroBitFont.cpp
        data: hex`
0000000000 4040400040 5050000000 50f850f850 70c8709870 c890204898 6090609068 4040000000 2040404020
4020202040 0050205000 0020702000 0000002040 0000700000 0000004000 0810204080 6090909060 2060202070
e0106080f0 f010209060 305090f810 f880f008f0 1020708870 f810204080 7088708870 7088702040 0040004000
0020002040 1020402010 0070007000 4020102040 7088300020 7088a89860 6090f09090 e090e090e0 7080808070
e0909090e0 f080e080f0 f080e08080 7080988870 9090f09090 e0404040e0 f810109060 90a0c0a090 80808080f0
88d8a88888 88c8a89888 6090909060 e090e08080 6090906030 e090e09088 70806010e0 f820202020 9090909060
8888885020 8888a8d888 9090609090 8850202020 f0204080f0 7040404070 8040201008 7010101070 2050000000
00000000f8 4020000000 0070909078 8080e090e0 0070808070 1010709070 6090e08070 3040e04040 7090701060
8080e09090 4000404040 1000101060 80a0c0a090 4040404030 00d8a88888 00e0909090 0060909060 00e090e080
0070907010 0070808080 00304020c0 4040704038 0090909078 0088885020 008888a8d8 0090606090 00885020c0
00f02040f0 3020602030 4040404040 c0406040c0 0000601800
`
    }
}

interface Image {
    //% helper=imagePrint
    print(text: string, x: number, y: number, color?: number, font?: image.Font): void;
}

namespace helpers {
    export function imagePrint(img: Image, text: string, x: number, y: number, color?: number, font?: image.Font) {
        x |= 0
        y |= 0
        if (!font) font = image.defaultFont
        if (!color) color = 15
        let x0 = x
        let cp = 0
        let byteWidth = (font.charWidth + 7) >> 3
        let charSize = byteWidth * font.charHeight
        let imgBuf = control.createBuffer(3 + charSize)
        imgBuf[0] = 0xf1
        imgBuf[1] = font.charWidth
        imgBuf[2] = font.charHeight
        let ximg = image.ofBuffer(imgBuf)
        while (cp < text.length) {
            let ch = text.charCodeAt(cp++)
            if (ch == 10) {
                y += font.charHeight + 2
                x = x0
            }
            if (ch < 32) continue
            let idx = (ch - font.firstChar) * charSize
            if (idx < 0 || idx + imgBuf.length - 1 > font.data.length)
                imgBuf.fill(0, 3)
            else
                imgBuf.write(3, font.data.slice(idx, charSize))
            img.drawIcon(ximg, x, y, color)
            x += font.charWidth
        }
    }
}

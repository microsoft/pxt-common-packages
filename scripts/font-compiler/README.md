# Font compiler and decompiler

The `font-compiler.js` script converts between two textual representations of bitmap
fonts, one of which is compact and the other one is human readable and easy to edit
using a regular text editor.

Below is an example of the compact representation:

```typescript
    {
        charWidth: 6,
        charHeight: 5,
        firstChar: 32,
        data: hex`
00000000004040400040505000000050f850f85070c8709870c89020489860906090684040000000
20404040204020202040005020500000207020000000002040000070000000000040000810204080
60909090602060202070e0106080f0f010209060305090f810f880f008f01020708870f810204080
70887088707088702040004000400000200020401020402010007000700040201020407088300020
7088a898606090f09090e090e090e07080808070e0909090e0f080e080f0f080e080807080988870
9090f09090e0404040e0f81010906090a0c0a09080808080f088d8a8888888c8a898886090909060
e090e080806090906030e090e0908870806010e0f820202020909090906088888850208888a8d888
90906090908850202020f0204080f0704040407080402010087010101070205000000000000000f8
402000000000709090788080e090e0007080807010107090706090e080703040e040407090701060
8080e090904000404040100010106080a0c0a090404040403000d8a8888800e09090900060909060
00e090e0800070907010007080808000304020c0404070403800909090780088885020008888a8d8
009060609000885020c000f02040f030206020304040404040c0406040c00000601800
`,
        uniData: hex`
d3003070888870f300306090906004016090f0901805017090907830060130788080780701307080
80701801f0e080f03019016090e0b070410180a0c080f0420140506040b04301a8c8a89888440160
e09090905a0130384020c05b0130304020c0790130f02040f07a0130f02040f07b0160f02040f07c
0160f02040f0
`,
    }
```

If you save it to `packed.txt` and run `node font-compiler.js packed.txt > human.txt`
you will get `human.txt` file with something like the following (the script will also complain
about lines it can't understand):

```
charWidth=6
charHeight=5
firstChar=32

* ' ' 32
. . . . . .
. . . . . .
. . . . . .
. . . . . .
. . . . . .

* '!' 33
. # . . . .
. # . . . .
. # . . . .
. . . . . .
. # . . . .

// ... more ...

* 'ź' 378
. . # # . .
# # # # . .
. . # . . .
. # . . . .
# # # # . .

* 'Ż' 379
. # # . . .
# # # # . .
. . # . . .
. # . . . .
# # # # . .
```

You can now edit pixels in this file - use `.` and `#` only for pixels. Spaces are ignored.
If you add new characters, you can use syntax like `* 1234` for character codes, or use the 
character itself, quoted, like so: `* 'ś'`. If you include both, the first one will be used.

After you're done editing `human.txt` run `node font-compiler.js human.txt > packed-updated.txt`.

In packed format, the 7 bit characters are stored in the `data` field, without any headers, 
whereas all other characters (typically non-English) are stored in `uniData` field,
where each character is stored as its 16 bit little endian code followed by the character
data.

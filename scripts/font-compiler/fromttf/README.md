# CJK pixel font

This folder contains a 12x12px rendering of
[Adobe Source Han Sans font](https://github.com/adobe-fonts/source-han-sans).

Only a subset of ideograms is drawn, based on frequency of characters in Japanese, Chinese
and Korean.

The Hangul subset is based on https://tools.ietf.org/html/draft-ietf-idn-lsb-ace-01
It contains 888 Hangul syllabus. Then all syllabus from https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Korean_5800
were added.

The ideogram frequencies are in the following files (characters in files are ordered
by frequency):
* freq-jp.txt - based on https://gallarotti.github.io/assets/2013/01/kanji.pdf
* freq-sc.txt - based on http://lingua.mtsu.edu/chinese-computing/statistics/char/list.php?Which=MO
* freq-uni.txt - all CJK, based on https://tools.ietf.org/html/draft-ietf-idn-lsb-ace-01

There are other possible sources of common characters:
* http://nihongo.monash.edu/jouyoukanji.html
* http://hanzidb.org/character-list/general-standard

The font is constructed by taking the Japanese or Chinese variant, depending on which 
one is more frequent.
Given the 12x12 nature of the font the differences in rendering are minimal anyway.

Font files are downloaded from here: https://github.com/adobe-fonts/source-han-sans/tree/release#language-specific-otfs
Use the OTF in Regular weight.

Font are converted using https://www.angelcode.com/products/bmfont/
There is a config for it checked in here.

# create Song

Create a song from the notes of one or more musical instruments.

```sig
music.createSong(hex`00780004080200`)
```

A song is composed of notes from different instruments in the Song Editor. The [Song Editor](/reference/music/song-editor) is displayed by clicking on the music staff window in the ``||music:song||`` block.

```block
music.createSong(hex`0078000408020200001c00010a006400f40164000004000000000000000000000000000500000430000400080001220c001000012514001800011e1c00200001222400280001252c003000012934003800012c3c004000011e03001c0001dc00690000045e010004000000000000000000000564000104000330000400080001290c001000011e1400180001251c002000012924002800011b2c003000012234003800011e3c0040000129`)
```

The Song Editor contains a `Treble` and `Bass` clef for you to compose your music with the notes from your selected instruments. You can set `tempo` an add measures to the staff shown in the editor window. When you're done, the song is set as general data into the **buffer** parameter.

## Parameters

* **buffer**: the data containing the notes played by each instrument in the song.

## Returns

* a [playable](/types/playable) object for the notes contained in **buffer**.

## Example #example

Play a song composed in the Song Editor.

```blocks
music.play(music.createSong(hex`0078000408020200001c00010a006400f40164000004000000000000000000000000000500000430000400080001220c001000012514001800011e1c00200001222400280001252c003000012934003800012c3c004000011e03001c0001dc00690000045e010004000000000000000000000564000104000330000400080001290c001000011e1400180001251c002000012924002800011b2c003000012234003800011e3c0040000129`), music.PlaybackMode.UntilDone)
```

## See also #seealso

[tone playable](/reference/music/tone-playable),
[string playable](/reference/music/string-playable),
[melody playable](/reference/music/melody-playable),
[song editor](/reference/music/song-editor)
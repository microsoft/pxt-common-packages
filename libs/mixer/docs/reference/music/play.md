# play

Play a song, melody, or tone from a playable music source.

```sig
music.play(music.createSong(hex`00780004080200`), music.PlaybackMode.UntilDone)
```

Music is played for a simple tone, a melody, or a song. Each of these music sources is called a [playble](/types/playable) object. The ``||music:play||`` block can take any of these playable objects and play them as sound output for your game.

The simpliest music source is a **tone**, on note play for a duration of time:

```block
music.play(music.tonePlayable(262, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
```

Then, there is the **melody** which is a series of notes played at a certain speed, or `tempo`. You can create your own melody of choose a built-in one to play:

```block
music.play(music.stringPlayable("D F E A E A C B ", 120), music.PlaybackMode.UntilDone)
music.play(music.melodyPlayable(music.magicWand), music.PlaybackMode.UntilDone)
```

The most complex playabe object is a **song**. Songs are composed in the Song Editor using many notes from different instruments.

```block
music.play(music.createSong(hex`0078000408020200001c00010a006400f40164000004000000000000000000000000000500000430000400080001220c001000012514001800011e1c00200001222400280001252c003000012934003800012c3c004000011e03001c0001dc00690000045e010004000000000000000000000564000104000330000400080001290c001000011e1400180001251c002000012924002800011b2c003000012234003800011e3c0040000129`), music.PlaybackMode.UntilDone)
```

## Parameters

* **toPlay**: the [playable](/types/playable) object, or music source, to play.
* **playbackMode**: the playback mode for continuing the program:
>* `play until done`: play the music source in **toPlay** but wait to run the next part of the program until music play is done.
>* `in background`: play the music source in **toPlay** but continue with the rest of the program before music play is done.
>* `in background looping`: play the music source in **toPlay** but continue with the rest of the program before music play is done. The music will remain playing, returning to the first note of the music after its duration.

## Examples #example

### Play a melody

Play a short melody created in the Melody Editor.

```blocks
music.play(music.stringPlayable("D F E A E A C B ", 120), music.PlaybackMode.UntilDone)
```

### Different music sources, one block to play them all

Put 4 different playable music sources in an array. Play one after the other.

```blocks
let playables = [
music.tonePlayable(262, music.beat(BeatFraction.Whole)),
music.stringPlayable("D F E A E A C B ", 120),
music.melodyPlayable(music.baDing),
music.createSong(hex`0078000408020200001c00010a006400f40164000004000000000000000000000000000500000430000400080001220c001000012514001800011e1c00200001222400280001252c003000012934003800012c3c004000011e03001c0001dc00690000045e010004000000000000000000000564000104000330000400080001290c001000011e1400180001251c002000012924002800011b2c003000012234003800011e3c0040000129`)
]
for (let someMusic of playables) {
    music.play(someMusic, music.PlaybackMode.UntilDone)
    pause(500)
}
```

## See also #seealso

[tone playable](/reference/music/tone-playable),
[string playable](/reference/music/string-playable),
[melody playable](/reference/music/melody-playable),
[create song](/reference/music/create-song)
# playable

The **playable** data object provides a common format to play tones, melodies, and songs. Each of these music sources are created in different ways but are transformed into playable objects so that a single playback method is used to [play](/refernece/music/play) them.

## Music sources for playable objects

The blocks used to create playable music soucres are the following:

### Tone

A tone is a musical note, or a sound frequency, and a duration. The duration is often set as the length of a `beat`.

```block
music.tonePlayable(262, music.beat(BeatFraction.Whole))
```

### Melody

Melodies are a series of notes and a tempo to play them at.

```block
music.stringPlayable("D F E A E A C B ", 120)
```

### Built-in sound

A built-in sound is a simple melody already composed for you. There are several you can choose from.

```block
music.melodyPlayable(music.baDing)
```

### Song

Songs are complex music sources which have many notes from different instruments. Songs are made in the Song Editor.

```block
music.createSong(hex`0078000408020200001c00010a006400f40164000004000000000000000000000000000500000430000400080001220c001000012514001800011e1c00200001222400280001252c003000012934003800012c3c004000011e03001c0001dc00690000045e010004000000000000000000000564000104000330000400080001290c001000011e1400180001251c002000012924002800011b2c003000012234003800011e3c0040000129`)
```

## Play the music

In your programs, you can simply use the ``||music:play||`` blocks for each playable object. Like this one for tone:

```block
music.play(music.tonePlayable(262, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
```

Or, this one for song:

```block
music.play(music.createSong(hex`0078000408020200001c00010a006400f40164000004000000000000000000000000000500000430000400080001220c001000012514001800011e1c00200001222400280001252c003000012934003800012c3c004000011e03001c0001dc00690000045e010004000000000000000000000564000104000330000400080001290c001000011e1400180001251c002000012924002800011b2c003000012234003800011e3c0040000129`), music.PlaybackMode.UntilDone)
```

## Example #example

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

[play](/reference/music/play), [tone playable](/reference/music/tone-playable),
[string playable](/reference/music/string-playable), [melody playable](/reference/music/melody-playable),
[create song](/reference/music/create-song)
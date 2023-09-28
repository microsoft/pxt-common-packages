# play

Play a song, melody, tone, or a sound effect from a playable music source.

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

The most complex playabe object is a **song**. Songs are composed in the [Song Editor](/reference/music/song-editor) using many notes from different instruments.

```block
music.play(music.createSong(hex`0078000408020200001c00010a006400f40164000004000000000000000000000000000500000430000400080001220c001000012514001800011e1c00200001222400280001252c003000012934003800012c3c004000011e03001c0001dc00690000045e010004000000000000000000000564000104000330000400080001290c001000011e1400180001251c002000012924002800011b2c003000012234003800011e3c0040000129`), music.PlaybackMode.UntilDone)
```

## Parameters

* **toPlay**: the [playable](/types/playable) object, or music source, to play.
* **playbackMode**: the playback mode for continuing the program:
>* `play until done`: play the music source in **toPlay** but wait to run the next part of the program until music play is done.
>* `in background`: play the music source in **toPlay** but continue with the rest of the program before music play is done.
>* `in background looping`: play the music source in **toPlay** but continue with the rest of the program before music play is done. The music will remain playing, returning to the first note of the music after its duration.

### ~ hint

#### Stop the music!

You can stop any music currently playing with the ``||music:stop all sounds||`` block. This is useful if **playbackMode** is set to `in background looping` and you wish to stop the music for a scene change or respond to an event with a different sound.

### ~

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

### Looping music play

Play a simple song in the background while a monkey moves around the screen. When the monkey hits the bubble in the middle of the screen, stop the song and play a bursting sound.

```blocks
let bubble = sprites.create(img`
    . . . . . b b b b b b . . . . . 
    . . . b b 9 9 9 9 9 9 b b . . . 
    . . b b 9 9 9 9 9 9 9 9 b b . . 
    . b b 9 d 9 9 9 9 9 9 9 9 b b . 
    . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
    b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
    b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
    b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
    b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
    b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
    b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
    . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
    . b d 5 3 3 3 3 3 3 3 d 5 b b . 
    . . b d 5 d 3 3 3 3 5 5 b b . . 
    . . . b b 5 5 5 5 5 5 b b . . . 
    . . . . . b b b b b b . . . . . 
    `, SpriteKind.Player)
let monkey = sprites.create(img`
    . . . . f f f f f . . . . . . . 
    . . . f e e e e e f . . . . . . 
    . . f d d d d e e e f . . . . . 
    . c d f d d f d e e f f . . . . 
    . c d f d d f d e e d d f . . . 
    c d e e d d d d e e b d c . . . 
    c d d d d c d d e e b d c . f f 
    c c c c c d d d e e f c . f e f 
    . f d d d d d e e f f . . f e f 
    . . f f f f f e e e e f . f e f 
    . . . . f e e e e e e e f f e f 
    . . . f e f f e f e e e e f f . 
    . . . f e f f e f e e e e f . . 
    . . . f d b f d b f f e f . . . 
    . . . f d d c d d b b d f . . . 
    . . . . f f f f f f f f f . . . 
    `, SpriteKind.Enemy)
monkey.setBounceOnWall(true)
monkey.x = scene.screenWidth()
monkey.setVelocity(50, 40)
music.play(music.stringPlayable("C5 A B G A F A C5 ", 120), music.PlaybackMode.LoopingInBackground)
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    music.stopAllSounds()
    sprites.destroy(sprite, effects.blizzard, 500)
    music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.UntilDone)
})
```
### Play a sound effect

Play a sine wave sound effect for `5` seconds.

```blocks
music.play(music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
```

## See also #seealso

[tone playable](/reference/music/tone-playable),
[string playable](/reference/music/string-playable),
[melody playable](/reference/music/melody-playable),
[create song](/reference/music/create-song),
[stop all sounds](/reference/music/stop-all-sounds),
[song editor](/reference/music/song-editor),
[create sound effect](/reference/music/create-sound-effect)
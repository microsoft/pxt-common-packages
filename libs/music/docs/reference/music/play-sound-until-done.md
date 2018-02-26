# play Sound Until Done

Play some notes of music you have placed in a string and wait the sound to finish playing.

```sig
music.playSoundUntilDone('')
```

Your program plays the sound and waits for the sound to finish.

The notes of your sound go into a [string](/types/string). The [**composing**](/reference/music/composing-sounds)
sounds page tells you how to make a sound string.

Also, there are built-in sounds you can use. These are part of the **Sounds** type. You use built-in sounds
instead of your own sound string with [``||music:sounds||``](/reference/music/sounds) like this:

```blocks
music.playSoundUntilDone(music.sounds(Sounds.JumpUp))
```

## #simnote
#### ~hint
**Simulator**

``||music:play sound until done||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``sound``: a string containing the notes of a sound you want to play. Look at
[composing sounds](/reference/music/composing-sounds) to find out how to make the sound string.


## Examples #example

### My sound string #ex1

Play a sound made with 5 notes and show green pixels. and show green pixels. The pixels light up after the sound
finishes.

```blocks
let mySound = "g5:1 f e d c";
music.playSound(mySound);
light.createStrip().setAll(Colors.Green);
```

### I'll play BaDing #ex2

Play a the built-in sound called `BaDing`.

```blocks
music.playSoundUntilDone(music.sounds(Sounds.BaDing))
```

## See also

[play sound](/reference/music/play-sound), [sounds](/reference/music/sounds),
[tempo](/reference/music/tempo), [set tempo](/reference/music/set-tempo),
[change tempo by](/reference/music/change-tempo-by)

[Composing sounds](/reference/music/composing-sounds)

```package
light
music
```
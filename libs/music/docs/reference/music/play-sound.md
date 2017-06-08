# play Sound

Play some notes of music you have placed in a string.

```sig
music.playSound('')
```

Your program doesn't wait for the sound to finish. Then next part of your program starts right away.

The notes of your sound go into a [string](/types/string). The [**composing**](/reference/music/composing-sounds)
sounds page tells you how to make a sound string.

Also, there are built-in sounds you can use. These are part of the **Sounds** type. You use built-in sounds
instead of your own sound string with [``||sounds||``](/reference/music/sounds) like this:

```blocks
music.playSound(music.sounds(Sounds.JumpUp))
```

## #simnote
#### ~hint
**Simulator**

``||play sound||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``sound``: a string containing the notes of a sound you want to play. Look at
[composing sounds](/reference/music/composing-sounds) to find out how to make the sound string.

## Examples #exsection

### My sound string #ex1

Play a sound made with 5 notes and show green pixels. The pixels light up before the sound
finishes.

```blocks
let mySound = "g5:1 f e d c"
music.playSound(mySound)
light.pixels.setAll(Colors.Green)
```
### I'll play BaDing #ex2

Play a the built-in sound called `BaDing`.

```blocks
music.playSound(music.sounds(Sounds.BaDing))
```

## See also

[``||play sound until done||``](/reference/music/play-sound-until-done), [``||sounds|``](/reference/music/sounds),
[``||tempo||``](/reference/music/tempo), [``||set tempo||``](/reference/music/set-tempo),
[``||change tempo by||``](/reference/music/change-tempo-by)

[Composing sounds](/reference/music/composing-sounds)

```package
music
light
```
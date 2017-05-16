# play Sound

Play some notes of music you have placed in a string.

```sig
music.playSound('')
```

Your program doesn't wait for the sound to finish. Then next part of your program starts right away.

The notes of your sound string look like this: 'g5:1 f e d c'. Each note has a name, like 'd', and there is
a space between each note in the string. You can have the note play longer by adding a _duration_ to the note
with a colon. Like the first note in the string, 'g5:1', the note name has a colon between the note and it's
duration. The duration tells how many beats to play the note for.

Also, there are built-in sounds you can use. These are part of the **Sounds** type. You use built-in sounds
instead of your own sound string with ``||sounds||`` like this:

```blocks
music.playSound(music.sounds(Sounds.JumpUp))
```

## #simnote
#### ~hint
**Sim**: ``||play sound||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``sound``: the notes of a sound put together as a string. These are note names or note names with a duration,
like: 'a' or 'c#:8'

## Examples #exsection

### My sound string #ex1

Play a sound made with these notes: 'g5:1 f e d c' and show green pixels. The pixels light up before the sound
finishes.

```blocks
music.playSound('g5:1 f e d c')
light.pixels.setAll(Colors.Green)
```
### I'll play BaDing #ex2

Play a the built-in sound called `BaDing`.

```blocks
music.playSound(music.sounds(Sounds.BaDing))
```

## See also

[``||play sound||``](/reference/music/play-sound), [``||sounds|``](/reference/music/sounds),
[``||tempo||``](/reference/music/tempo), [``||set tempo||``](/reference/music/set-tempo),
[``||change tempo by||``](/reference/music/change-tempo-by)



# set Volume

Set the volume for the sound synthesizer.

The synthesizer volume controls the
level of the sound playing on current sound output of the board (speaker or pin).

```sig
music.setVolume(128)
```

## #simnote
#### ~hint
**Sim**: ``||set volume||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``volume``: the volume of of the sounds played to the sound output. The volume [number](/reference/types) can be between `0` for silent and `255` for the loudest sound.

## Example #exsection

Set the synthesizer volume to something quieter.

```blocks
music.setVolume(50)
music.playSound(music.sounds(Sounds.BaDing))
```

## See also

[``||play sound||``](/reference/music/play-sound), [``||sounds|``](/reference/music/sounds)


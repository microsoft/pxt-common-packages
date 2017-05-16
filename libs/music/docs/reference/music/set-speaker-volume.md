# set Speaker Volume

Set the volume for the speaker on the board.

```sig
music.setSpeakerVolume(128)
```

## #simnote
#### ~hint
**Sim**: ``||set speaker volume||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``volume``: the volume of of the sounds played on the speaker. The volume [number](/reference/types) can be
between `0` for silent and `255` for the loudest sound.

## Example #exsection

Set the speaker volume to something quieter.

```blocks
music.setSpeakerVolume(50)
music.playSound(music.sounds(Sounds.BaDing))
```

## See also

[``||play sound||``](/reference/music/play-sound), [``||sounds|``](/reference/music/sounds)


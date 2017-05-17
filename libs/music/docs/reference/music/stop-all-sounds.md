# stop All Sounds

Stop all the sounds that are playing right now and any others waiting to play.

```sig
music.stopAllSounds()
```

If you use [``||play sound||``](/reference/music/play-sound) more than once, the sounds you asked to play later
have to wait until the sounds played earlier finish. You can stop the sound that is playing now and all the
sounds waiting to play with ``||stop all sounds||``.

## #simnote
#### ~hint
**Sim**: ``||stop all sounds||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Example #exsection

Play a sound but stop it right away.

```blocks
music.playSound(music.sounds(Sounds.Wawawawaa))
music.stopAllSounds()
```

## See also

[``||play sound||``](/reference/music/play-sound), [``||play sound until done||``](/reference/music/play-sound-until-done)


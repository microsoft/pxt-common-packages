# set Pitch Pin

Choose which pin to play on when sound is supposed to go to a pin.

```sig
music.setPitchPin(pins.A3)
```
## #pins

Some of the pins on the @boardname@ can play sounds. These are probably the analog output pins on the board.
Not all of the pins on your board are output pins or can play sound.

## #simnote
### ~hint
**Simulator**: ``||music:set pitch pin||`` works on the @boardname@. It might not work in the simulator on every browser.
### ~

## Parameters

* ``pin``: the pin to play sound at when sound goes to a pin.

## Example #example

Set pitch pin to ``A1``. Switch the sound output to ``pin`` and play a tone.

```blocks
music.setOutput(SoundOutputDestination.Pin)
music.setPitchPin(pins.A1)

music.playTone(
    music.noteFrequency(Note.Bb),
    music.beat(BeatFraction.Half)
)
```

## See also #seealso

[set output](/reference/music/set-output)

```package
music
```
# set Output

Set the sound output to the speaker or to a pin.

```sig
music.setOutput(SoundOutputDestination.Speaker)
```
When your board has a speaker or analog output pins, you can play sounds on them. Use ``||set output||``
to choose where you want to play your sounds.

## #simnote
### ~hint
**Simulator**

``||set output||`` works on the @boardname@. It might not work in the simulator on every browser.
### ~

## Parameters

* ``out``: this is where the sound output will go. You can choose ``speaker`` or ``pin``.

## Example #example

Change the output for the sound to go to a pin on @boardname@.

```blocks
music.setOutput(SoundOutputDestination.Pin)
music.playTone(
    music.noteFrequency(Note.Bb),
    music.beat(BeatFraction.Half)
)
```

## See also #seealso

[set pitch pin](/reference/music/set-pitch-pin)
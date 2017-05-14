# Play Tone

Play a musical tone through a pin on the @boardname@ for as long as you say.

## Simulator #sim

This function might work only on the @boardname@. Some browsers may not have the ability to play tones.

```sig
music.playTone(262, music.beat(BeatFraction.Whole))
```

## Parameters

* ``pin`` is the pin to play the tone on.
* ``frequency`` is the [number](/types/number) of Hertz (how high or low the tone is).
* ``ms`` is the [number](/types/number) of milliseconds (one thousandth of a second) the tone will last

## Example #example

Store the musical note C in the variable `freq`.
Next, play that note for 1000 milliseconds (one second).

```blocks
let freq = music.noteFrequency(Note.C);
music.playTone(freq, 1000)
```

### See also

[rest](/reference/music/rest), [ring tone](/reference/music/ring-tone) , [tempo](/reference/music/tempo), [set tempo](/reference/music/set-tempo), 
[change tempo by](/reference/music/change-tempo-by)


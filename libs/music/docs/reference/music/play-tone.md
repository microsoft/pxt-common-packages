# Play Tone

Play a musical tone through a pin on the @boardname@ for as long as you say.

## Simulator #sim

This function only works on the @boardname@ and in some browsers.

```sig
pins.playTone(Notes.A, music.beat(BeatFraction.Whole))
```

### Parameters

* ``frequency`` is the [number](/types/number) of Hertz (how high or low the tone is).
* ``ms`` is the [number](/types/number) of milliseconds that the tone lasts

### Special handling of values

* If ``frequency`` is less or equal to zero, the sound is stopped.
* If ``ms`` is negative or zero, the sound is not stopped and will keep beeping.

## Example #example

This example stores the musical note C in the variable `freq`.
Next, it plays that note for 1000 milliseconds (one second).

```blocks
let freq = music.noteFrequency(Note.C);
pins.playTone(freq, 1000)
```

### See also

[rest](/reference/music/rest), [ring tone](/reference/music/ring-tone) , [tempo](/reference/music/tempo), [set tempo](/reference/music/set-tempo), 
[change tempo by](/reference/music/change-tempo-by)


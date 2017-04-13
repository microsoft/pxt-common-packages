# Rest

Rest (play no sound) through a pin of your choice for the amount of time you say.

## Simulator #sim

This function only works on the @boardname@ and in some browsers.

```sig
pins.A8.rest(400);
```

### Parameters

* ``pin`` is the pin to play the tone from.
* ``ms`` is a [number](/types/number) saying how many
  milliseconds the @boardname@ should rest. One second is 1000
  milliseconds.

## Example #example

```blocks
let frequency = music.noteFrequency(Note.C)
pins.A8.playTone(frequency, 1000)
pins.A8.rest(1000)
```

### See also

[play tone](/reference/music/play-tone), [ring tone](/reference/music/ring-tone) , [tempo](/reference/music/tempo), [set tempo](/reference/music/set-tempo), [change tempo by](/reference/music/change-tempo-by)


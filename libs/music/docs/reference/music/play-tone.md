# play Tone

Play a musical tone on the speaker for some amount of time.

```sig
music.playTone(Note.C, 10)
```
## #simnote
#### ~hint
**Sim**: ``||play tone||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``frequency`` is the [number](/types/number) of [Hertz](https://wikipedia.org/wiki/Hertz) (how high or low the tone is, also known as _pitch_).
* ``ms`` is the [number](/types/number) of milliseconds (one-thousandth of a second) that the tone lasts for.

## Special handling of values

* If ``frequency`` is less or equal to zero, the sound is stopped.
* If ``ms`` is negative or zero, the sound is not stopped and will keep beeping.

## Example #example

Store the musical note 'C' in the variable `freq` and play that note for 1000 milliseconds (one second).

```blocks
let freq = music.noteFrequency(Note.C);
music.playTone(freq, 1000)
```

## See also #seealso

[rest](/reference/music/rest), [ring tone](/reference/music/ring-tone) , [tempo](/reference/music/tempo),
[set tempo](/reference/music/set-tempo), [change tempo by](/reference/music/change-tempo-by)

```package
music
```
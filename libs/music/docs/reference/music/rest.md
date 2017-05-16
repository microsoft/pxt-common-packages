# rest

Give the speaker a period of time to not play any sound.

```sig
music.rest(400);
```
## #simnote
#### ~hint
**Sim**: ``||rest||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``ms`` is a [number](/types/number) saying how many
  milliseconds the @boardname@ should rest. One second is 1000
  milliseconds.

## Example #example

Play a 'C' note for one second and then rest for one second. Do it again, and again...

```blocks
let frequency = music.noteFrequency(Note.C)
loops.forever(() => {
  music.playTone(frequency, 1000)
  music.rest(1000)
})
```

## See also

[``||play tone||``](/reference/music/play-tone), [``||ring tone||``](/reference/music/ring-tone),
[``||tempo||``](/reference/music/tempo), [``||set tempo||``](/reference/music/set-tempo),
[``||change tempo by||``](/reference/music/change-tempo-by)


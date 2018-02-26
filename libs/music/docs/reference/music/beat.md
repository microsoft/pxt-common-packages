# beat

Get the length of time for a musical beat.

```sig
music.beat(BeatFraction.Whole)
```

## Parameters

* ``fraction`` means fraction of a beat (BeatFraction.Whole, BeatFraction.Sixteenth, etc.) 

## Returns

* a [number](/types/number) that is the amount of time in milliseconds (one-thousandth of a second) for the beat fraction.

## Example #xample

```blocks
music.playTone(Note.C, music.beat(BeatFraction.Quarter))
```

## See also #seealso

[play tone](/reference/music/play-tone), [ring tone](/reference/music/ring-tone),
[rest](/reference/music/rest), [set tempo](/reference/music/set-tempo),
[change tempo by](/reference/music/change-tempo-by)

```package
music
```
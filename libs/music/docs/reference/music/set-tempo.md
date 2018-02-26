# set Tempo 

Make the tempo (speed) of the music playing go faster or slower.

```sig
music.setTempo(60)
```

## #simnote
#### ~hint
**Sim**: ``||set tempo||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

## Parameters

* ``bpm`` is a [number](/types/number) that means the amount _beats per minute_ you want. This is how fast
you want @boardname@ to play music.

## Example #example

Set the music tempo to 240 beats per minute.

```blocks
music.setTempo(240)
```

## See also #seealso

[play tone](/reference/music/play-tone), [ring tone](/reference/music/ring-tone),
[rest](/reference/music/rest), [tempo](/reference/music/tempo),
[change tempo by](/reference/music/change-tempo-by)

```package
music
```
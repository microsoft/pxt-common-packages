# ring Tone

Play a musical tone on the speaker. The tone has a pitch (frequency) as high or low as you say.
The tone will keep playing until tell it to stop.

```sig
music.ringTone(0);
```

## #simnote
### ~hint
**Simulator**: ``||music:ring tone||`` works on the @boardname@. It might not work in the simulator on every browser.
### ~

The tone will keep playing until you stop it with [``||music:stop all sounds||``](/reference/music/stop-all-sounds).

## Parameters

* ``frequency`` is a [number](/types/number) that says
how high-pitched or low-pitched the tone is.  This
number is in **Hz** (**Hertz**), which is a measurement of frequency (_pitch_).

## Example #example

Play a tone with a base frequency of ``440`` but change it by ``20`` Hertz steps both up and down.

```blocks
let offset = 0
offset = -100
forever(function () {
    while (offset < 100) {
        offset += 20
        music.ringTone(440 + offset)
        pause(300)
    }
    while (offset > -100) {
        offset += -20
        music.ringTone(440 + offset)
        pause(300)
    }
})
```

## See also #seealso

[rest](/reference/music/rest), [play tone](/reference/music/play-tone),
[tempo](/reference/music/tempo), [set tempo](/reference/music/set-tempo),
[change tempo by](/reference/music/change-tempo-by)

```package
music
```

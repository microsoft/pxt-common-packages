# ring Tone

Play a musical tone on the speaker. The tone has a pitch (frequency) as high or low as you say.
The tone will keep playing until tell it to stop.

```sig
music.ringTone(0);
```

## #simnote
#### ~hint
**Sim**: ``||ring tone||`` works on the @boardname@. It might not work in the simulator on every browser.
#### ~

The tone will keep playing until you stop it with [``||stop all sounds||``](/reference/music/stop-all-sounds).

## Parameters

* ``frequency`` is a [number](/types/number) that says
how high-pitched or low-pitched the tone is.  This
number is in **Hz** (**Hertz**), which is a measurement of frequency (_pitch_).

## Example #example

This program checks the **accelerometer** for the @boardname@'s
[**acceleration**](/reference/input#acceleration) (how much the @boardname@ is speeding up or slowing
down). Then it uses that acceleration to set the frequency of a tone.

If the movement of @boardname@
speeds up, the pitch of the tone gets higher. If it slows down, the
pitch gets lower. It's fun -- try it!

```blocks
loops.forever(() => {
    music.ringTone(input.acceleration(Dimension.X));
})
```

### See also

[``||rest||``](/reference/music/rest), [``||play tone||``](/reference/music/play-tone),
[``||tempo||``](/reference/music/tempo), [``||set tempo||``](/reference/music/set-tempo),
[``||change tempo by||``](/reference/music/change-tempo-by)

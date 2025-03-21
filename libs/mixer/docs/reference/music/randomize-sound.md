# randomize Sound

Make a new sound similar to the original one but with some variations.

```sig
music.randomizeSound(music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear))
```

The resulting sound effect will randomize some of the parameters of the original sound effect to create differences from the original sound.

## Parameters

* **sound**: the original [sound-effect](/types/sound-effect).

## Returns

* a new [sound-effect](/types/sound-effect) with some differences from the oringal **sound**.

## Example

Randomize and play a sine wave sound effect.

```blocks
music.play(music.randomizeSound(music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear)), music.PlaybackMode.UntilDone)
```

## See also

[play](/reference/music/play),
[create sound effect](/reference/music/create-sound-effect)

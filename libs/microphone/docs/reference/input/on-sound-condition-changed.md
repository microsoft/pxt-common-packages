# on Sound Condition Changed

Run some code when the sound conditions change.

```sig
input.onSoundConditionChanged(LoudnessCondition.Quiet, () => {
	light.pixels.setBrightness(light.fade(Colors.Red,128))
})
```

## Parameters

* **condition**: the sound condition to check for
>  * ``quiet``: sound levels are low, not much noise
>  * ``loud``: sound levels are high, it's quite noisy
* **handler**: the code to run sound conditions change

## Example

Dim the red pixels to half their brightness when sounds are quiet.

```blocks
input.onSoundConditionChanged(LoudnessCondition.Quiet, () => {
	light.pixels.setBrightness(light.fade(Colors.Red,128))
})
```
# See also

[``||sound level||``](/reference/input/sound-level)

```package
microphone
```
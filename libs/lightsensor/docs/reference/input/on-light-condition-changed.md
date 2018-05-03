# on Light Condition Changed

Run some code when the light conditions change.

```sig
input.onLightConditionChanged(LightCondition.Dark, function() {
});
```
What decides that the light condition is dark or bright? A number between `0` and `255` is set for both of these light level conditions. These light level values decide which condition means ``dark`` and which condition means ``bright``. They are set by the ``||input:set light threshold||`` function.

## Parameters

* **condition**: the lighting condition to detect
>  * ``dark``: Dark, no light detected
>  * ``bright``: Light is bright enough to detect
* **handler**: code to run when light conditions change

## Example #example

Dim the red pixels to half intensity when light conditions turn dark.

```blocks
input.onLightConditionChanged(LightCondition.Dark, function() {
	light.createStrip().setBrightness(light.fade(light.rgb(255, 0, 0), 128))
})
```

## See also #seealso

[light level](/reference/input/light-level),
[set light threshold](/reference/input/set-light-threshold)
# on Light Condition Changed

Run some code when the light conditions change.

```sig
input.onLightConditionChanged(LightCondition.Dark, function() {
});
```
What decides that the light condition is dark or bright? A number between `0` and `1023` is chosen for the light level that will mean either dark or bright.

## Parameters

* **condition**: the lighting condition to detect
>  * ``Dark``: Dark, no light detected
>  * ``Bright``: Light is bright enough to detect
* **handler**: code to run when light conditions change

## Example #example

Dim the red pixels to half intensity when light conditions turn dark.

```blocks
input.onLightConditionChanged(LightCondition.Dark, function() {
	light.createStrip().setBrightness(light.fade(Colors.Red, 128))
})
```

## See also #seealso

[light level](/reference/input/light-level)
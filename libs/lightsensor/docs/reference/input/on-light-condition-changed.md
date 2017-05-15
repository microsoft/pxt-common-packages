# on Light Condition Changed

Run some code when the light conditions change.

```sig
input.onLightConditionChanged(LightCondition.Dark, () => {
	light.pixels.setBrightness(light.fade(Colors.Red,128))
})
```

## Parameters

* **condition**: the lighting condition to detect
>  * ``Dark``: Dark, no light detected
>  * ``Bright``: Light is bright enough to detect
* **handler**: code to run when light conditions change

## Example

Dim the red pixels to half intensity when light conditions turn dark.

```blocks
input.onLightConditionChanged(LightCondition.Dark, () => {
	light.pixels.setBrightness(light.fade(Colors.Red,128))
})
```
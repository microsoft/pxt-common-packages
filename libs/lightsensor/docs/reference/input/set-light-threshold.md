# set Light Threshold

Tell how bright or dark it should be to make a light event happen.

```sig
input.setLightThreshold(LightCondition.Dark, 0)
```

The [``||input:on light condition changed||``](/reference/input/on-light-condition-changed) event will start
when the light condition reaches a certain brightness. You decide if you want the event to happen when
light is getting brighter or getting darker. This is set by choosing `bright` or `dark` for **condition**
in ``||input:set light threshold||``. Also, you say what level of brightness makes the event happen as
light gets brighter or darker.

## Parameters

* **conditon**: the light condition you are checking for, either `dark` or `bright`.
* **value**: a [number](/types/number) which is the brightness value that will make a light event happen.

## Example #example

Set a light condition for when light goes from bright to half dark. Make the pixels fade to half red when
that happens.

```blocks
const halfBright = 127;
let pixels = light.createStrip();

pixels.setAll(Colors.Red);
input.setLightThreshold(LightCondition.Dark, halfBright);
input.onLightConditionChanged(LightCondition.Dark, () => {
	pixels.setBrightness(light.fade(Colors.Red, halfBright));
});
```

## See also

[``||on light condition changed||``](/reference/input/on-light-condition-changed)

```package
lightsensor
```
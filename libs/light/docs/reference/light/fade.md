# fade

Fade a color by an amount of brightness.

```sig
light.fade(128, 128);
```

The amount of brightness you fade the color to goes from 0 (totally dark, no color left) to 255
(all of the current color, no change in brightness). Somewhere in between those two numbers is
the shade tht you want the color faded to.

## Parameters

* **color**: a [number](/reference/blocks/number) that is the RGB color that will get faded, like: Colors.Blue
* **brightness**: a [number](/reference/blocks/number) between `0` (totally dark) and `255` (full brightness, no fading at all)

## Returns

* a [number](/types/number) that is the RGB value for the faded color.

## Example

Fade the `green` light of the the pixels to half brightness when the `A` button is pressed.
The number `128` is just about one-half of full brightness (255).
```blocks
input.buttonA.onEvent(ButtonEvent.Click, () => {
    light.pixels.setAll(light.fade(Colors.Green, 128))
})
```

[``||rgb||``](/reference/light/rgb)

```package
light
```



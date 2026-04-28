# set Gradient

Set a gradient between two RGB colors.

```sig
light.createStrip().setGradient(0, 0)
```

The default color gradient for a LED strip is `black` to `white` which is between `0x000000` and `0xffffff` in RGB values. you change that gradient by selecting two other colors to begin and end the gradient range.

## Parameters

* **startColor**: a [number](/types/number) that is an RGB value for the gradient starting color.
* **endColor**: a [number](/types/number) that is an RGB value for the gradient ending color.

## Example

Set a strip color gradient between `blue` and `red`.

```blocks
let strip = light.createStrip()
strip.setGradient(0x0000cc, 0x880000)
```

## See Also

[pixel color](/reference/light/neopixelstrip/pixel-color), [rgb](/reference/light/rgb)

```package
light
```

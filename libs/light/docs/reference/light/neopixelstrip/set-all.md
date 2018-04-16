# set All

Make all of the pixels on the strip show one color.

```sig
light.createStrip().setAll(0xff0000);
```

## Parameters

* **rgb**: a [number](/types/number) that is the RGB color for all of the pixels.

## Example

Set all of the pixels to `pink`.

```blocks
let strip = light.createStrip()
strip.setAll(0xff007f)
```

[``||rgb||``](/reference/light/rgb)

```package
light
```



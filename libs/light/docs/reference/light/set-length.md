# set Length

Set the number of LEDs to use in the default NeoPixel strip.

```sig
light.defaultStrip().setLength(1)
```

The default strip will have a maximum length of addressable LEDs. You can set it to have a length less than or equal to the maximum length. Nothing will happen to any LEDs beyond this length if attempt to control is made.

## Parameters

* **numLeds**: a [number](/types/number) that is the current length to set for the default LED strip.

## Example

Set the default LED strip length to `8`.

```blocks
light.setLength(8)
```

[length](/reference/light/range)

```package
light
```



# set Length

Set the number of LEDs to use in a NeoPixel strip.

```sig
light.createStrip().setLength(1)
```

The strip will have a maximum length of addressable LEDs. You can set it to have a length less than or equal to the maximum length. Nothing will happen to any LEDs beyond this length if attempt to control is made.

## Parameters

* **numLeds**: a [number](/types/number) that is the current length to set for the LED strip.

## Example

Set the LED strip length to `8`.

```blocks
let strip = light.createStrip()
strip.setLength(8)
```

[length](/reference/light/neopixelstrip/length)

```package
light
```



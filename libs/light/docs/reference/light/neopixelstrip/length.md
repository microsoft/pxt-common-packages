# length

The number of pixels that are on a pixel strip.

```sig
light.createStrip().length()
```

## Returns

* The [number](/types/number) of pixels on the pixel strip.

## Example

Shift an `orange` pixel from the beginning of the pixel strip to the end.

```blocks
let strip = light.createStrip()
strip.setPixelColor(0, 0xff7f00)
for (let i = 0; i < strip.length() - 1; i++) {
    pause(500)
    strip.move(LightMove.Shift, 1)
}
```
## See also

[``||range||``](/reference/light/neopixelstrip/range)

```package
light
```



# length

The number of pixels that are on a pixel strip.

```sig
light.pixels.length()
```

## Returns

* The [number](/types/number) of pixels on the pixel strip.

## Example

Shift an `orange` pixel from the beginning of the pixel strip to the end.

```blocks
light.pixels.setPixelColor(0, Colors.Orange)
for (let i = 0; i < light.pixels.length() - 1; i++) {
    loops.pause(500)
    light.pixels.move(LightMove.Shift, 1)
}
```
## See also

[``||range||``](/reference/light/neopixelstrip/range)

```package
light
```



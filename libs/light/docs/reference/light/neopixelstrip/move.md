# move

Make the pixels appear to move along the pixel strip.

```sig
light.createStrip().move(LightMove.Rotate, 1)
```

A pixel on the strip looks like it's moving when the next pixel changes to
the same color and brightness. If this happens for every pixel in the strip,
it looks like every pixel in the strip is moving.

You can make the pixels move until they run off the end of the strip, this is a
`shift`. Or, you can have the pixels move around the strip using `rotate`. The
pixels move by the number of pixel spots you want.

## Parameters

* **kind** how the pixels should move, either `shift` or `rotate`
* **offset** the [number](/types/number) of pixel spots to move the pixels by

## Example

Make two blue pixels rotate around the strip one pixel spot at a time.

```blocks
let strip = light.createStrip()
strip.setPixelColor(0, Colors.Blue)
strip.setPixelColor(1, Colors.Blue)
loops.forever(() => {
    strip.move(LightMove.Rotate, 1)
    loops.pause(500)
})
```

```package
light
```



# set Pixel Color

Set the color of the pixel at this location to a new color.

```sig
light.createStrip().setPixelColor(0, 0)

```

## Parameters

* **pixelOffset**: the position on the strip (or the board) of the pixel whose
color you want to change.
* **color**: an [RGB](/reference/light/rgb#rgbdesc) color to change the pixel to.

## Example #exsection

When button ``B`` is clicked, show the ``pink`` color at pixel ``0``.

```blocks
input.buttonB.onEvent(ButtonEvent.Click, () => {
    light.createStrip().setPixelColor(0, Colors.Pink)
})
```

## See Also
[``||pixel color||``](/reference/light/neopixelstrip/pixel-color), [``||rgb||``](/reference/light/rgb)

```package
light
```

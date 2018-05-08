# draw Rect

Draw an ouline around a rectangle with a pixel color.

```sig
image.create(0,0).drawRect(0,0,0,0,0)
```

A rectangular outline is drawn in an image. The line width of the outline is one pixel wide drawn with the color you choose.

## Parameters

* **x**: a [number](/types/number) that's the horizontal pixel location of the upper-left corner of the rectangle to draw.
* **y**: a [number](/types/number) that's the vertical pixel location of the upper-left corner of the rectangle to draw.
* **w**: a [number](/types/number) that's the width in pixels of the rectangle.
* **h**: a [number](/types/number) that's the height in pixels of the rectangle.
* **c**: the [number](/types/number) of the color to draw the rectangular outline with. Color numbers are value between `0` and `15` which select a color from the current palette of colors.

## Example #example

Fill an entire image with all blue pixels. Draw a red outline around the image.

```blocks
let showBlue: Sprite = null
let blueRect: Image = null
blueRect = image.create(32, 32)
blueRect.fill(3)
blueRect.drawRect(0, 0, 32, 32, 10)
showBlue = sprites.create(blueRect)
```

## See also #seealso

[fill rect](/reference/images/image/fill-rect),
[draw line](/reference/images/image/draw-line)



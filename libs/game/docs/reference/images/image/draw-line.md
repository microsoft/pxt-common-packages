# draw Line

Draw a line from one point in an image to another point.

```sig
image.create(0,0).drawLine(0,0,0,0,0)
```

The pixels are located at points in the image. The point is a _coordinate_ which is two values that are a horizontal position and a vertical position. A line is drawn by setting the color of the pixels directly between two coordinates. The line has a width of one pixel.

## Parameters

* **x0**: a [number](/types/number) that's the horizontal pixel location of the first coordinate.
* **y0**: a [number](/types/number) that's the vertical pixel location of the first coordinate.
* **x1**: a [number](/types/number) that's the horizontal pixel location of the second coordinate.
* **y1**: a [number](/types/number) that's the vertical pixel location of the second coordinate.
* **c**: the [number](/types/number) of the color of the pixels in the line. Color numbers are value between `0` and `15` which select a color from the current palette of colors.

## Example #example

Draw a big `X` in image by making two diagonal lines.

```blocks
let showBigX: Sprite = null
let drawBigX: Image = null
drawBigX = image.create(32, 32)
drawBigX.fill(1)
drawBigX.drawLine(0, 0, 31, 31, 10)
drawBigX.drawLine(0, 31, 31, 0, 10)
showBigX = sprites.create(drawBigX)
```

## See also #seealso

[draw rect](/reference/images/image/draw-rect)


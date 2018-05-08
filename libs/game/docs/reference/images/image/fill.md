# fill

Set all the pixels of an image to one color.

```sig
image.create(0,0).fill(0)
```

## Parameters

* **c**: the [number](/types/number) of the color to set all the pixels in image to. Color numbers are value between `0` and `15` which select a color from the current palette of colors.

## Example #example

Fill an entire image with all blue pixels. Fill a small rectangle in the center of the image with yellow pixels.

```blocks
let showBlue: Sprite = null
let blueRect: Image = null
blueRect = image.create(32, 32)
blueRect.fill(3)
blueRect.fillRect(8, 8, 16, 16, 14)
showBlue = sprites.create(blueRect)
```

## See also #seealso

[fill rect](/reference/images/image/fill-rect),
[replace](/reference/images/image/replace)

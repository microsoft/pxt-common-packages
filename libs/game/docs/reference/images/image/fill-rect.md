# fill Rect

Set all the pixels within a rectangular area of an image to one color.

```sig
image.create(0,0).fillRect(0,0,0,0,0)
```

You can fill all of pixels in a rectanluar area at once with a color. The fill rectangle can be either the entire image area or some smaller part of it.

## Parameters

* **x**: a [number](/types/number) that's the horizontal pixel location of the upper-left corner of the fill rectangle.
* **y**: a [number](/types/number) that's the vertical pixel location of the upper-left corner of the fill rectangle.
* **w**: a [number](/types/number) that's the width in pixels of the fill rectangle.
* **h**: a [number](/types/number) that's the height in pixels of the fill rectangle.
* **c**: the [number](/types/number) of the color to set all the pixels in the rectangle to. Color numbers are value between `0` and `15` which select a color from the current palette of colors.

## Examples #example

### Center square #ex1

Fill an entire image with all blue pixels. Fill a small rectangle in the center of the image with yellow pixels.

```blocks
let showBlue: Sprite = null
let blueRect: Image = null
blueRect = image.create(32, 32)
blueRect.fill(3)
blueRect.fillRect(8, 8, 16, 16, 14)
showBlue = sprites.create(blueRect)
```

### Chessboard

Make a chessboard by filling in dark squares over top of a white background.

```blocks
let showBoard: Sprite = null
let chessBoard: Image = null
chessBoard = image.create(64, 64)
chessBoard.fill(1)
for (let row = 0; row <= 7; row++) {
    for (let col = 0; col <= 3; col++) {
        if (row % 2 == 1) {
            chessBoard.fillRect(col * 16, row * 8, 8, 8, 8)
        } else {
            chessBoard.fillRect(col * 16 + 8, row * 8, 8, 8, 8)
        }
    }
}
showBoard = sprites.create(chessBoard)
```

## See also #seealso

[fill](/reference/images/image/fill),
[draw rect](/reference/images/image/draw-rect)

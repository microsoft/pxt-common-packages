# flip Y

Flip the pixels vertically from one side to the other side.

```sig
image.create(0, 0).flipY()
```

The pixels in each half of the image are moved across to the other half. This happens in the vertical direction. They are "flipped" across an imaginary line that goes across the middle of the image. So, in an image with a size of 10 x 10, a pixel at a location of (3, 2) will move to (3, 8) and the pixel that was originally at (3, 8) will move to (3, 2).

If an image has on odd number of rows, then the "center line" goes through a row of pixels. When those pixels are "flipped" they keep their same location and don't move.

## Example #example

Flip and arrow image `3` times vertically.

```blocks
let showArrow: Sprite = null
let upArrow: Image = null
upArrow = img`
. . . a . . .
. . a a a . .
. a a . a a .
a a a . a a a
. . a . a . .
. . a . a . .
. . a . a . .
. . a . a . .
. . a . a . .
. . a . a . .
. . a . a . .
. . a a a . .
`
showArrow = sprites.create(upArrow)
for (let i = 0; i < 3; i++) {
    pause(500)
    upArrow.flipY()
}
```

## See also #seealso

[flip x](/reference/images/image/flip-x),
[scroll](/reference/images/image/scroll)
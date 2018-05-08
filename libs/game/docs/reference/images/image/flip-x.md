# flip X

Flip the pixels horizontally from one side to the other side.

```sig
image.create(0, 0).flipX()
```

The pixels in each half of the image are moved across to the other half. This happens in the horizontal direction. They are "flipped" across an imaginary line that goes down the middle of the image. So, in an image with a size of 10 x 10, a pixel at a location of (3, 4) will move to (6, 4) and the pixel that was originally at (6, 4) will move to (3, 4).

If an image has on odd number of columns, then the "center line" goes through a column of pixels. When those pixels are "flipped" they keep their same location and don't move.

## Example #example

Flip and arrow image `3` times horizontally.

```blocks
let showArrow: Sprite = null
let leftArrow: Image = null
leftArrow = img`
. . . a . . . . . . . . . . 
. . a a . . . . . . . . . . 
. a a a a a a a a a a a a a 
a a . . . . . . . . . . . a 
. a a a a a a a a a a a a a 
. . a a . . . . . . . . . . 
. . . a . . . . . . . . . . 
`
showArrow = sprites.create(leftArrow)
for (let i = 0; i < 3; i++) {
    pause(500)
    leftArrow.flipX()
}
```

## See also #seealso

[flip y](/reference/images/image/flip-y),
[scroll](/reference/images/image/scroll)
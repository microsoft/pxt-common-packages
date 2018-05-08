# clone

Copy an image to make another just like it.

```sig
image.create(0, 0).clone()
```

A new image is created that is a copy of the original. The image layout and pixel colors are the same.

## Returns

* an [image](/types/image) that is an exact copy of the original image.

## Example #example

Make a image layout for a stick figure person. Clone the image and display it below the original image.

```blocks
let stickPerson1 = img`
. . . a a . . .
. . a . . a . .
. . . a a . . .
. . . a . . . .
a a a a a a a .
. . . a . . . .
. . . a . . . .
. . . a . . . .
. . . a . . . .
. . a   a . . .
. a . . . a . .
. a a . . a a .
`
let stickPerson2 = stickPerson1.clone()

let showPerson1 = sprites.create(stickPerson1)
let showPerson2 = sprites.create(stickPerson2)
showPerson2.y = showPerson1.y + 16
```

## See also #seealso

[create](/reference/images/create)


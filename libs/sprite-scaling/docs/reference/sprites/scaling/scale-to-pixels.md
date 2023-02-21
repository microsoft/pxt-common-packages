# scale To Pixels

Scale a sprite to a number of pixels in a direction from an anchor point.

```sig
scaling.scaleToPixels(null, 1, ScaleDirection.Uniformly, ScaleAnchor.Middle)
```

A sprite can scale to a number of pixels in a direction from an anchor point. The scaling can be in just in the direction chosen, or the sprite can scale proportionally in the other direction too. 

## Proportional scaling

If the scale direction is `vertically` or `horizontally` but **proportional** is set to `false`, the sprite will scale to the number of pixels given in **value** only in the chosen direction. The sprite will expand in height but the width will stay the same or the sprite will expand in width but the height will stat the same.

If the scaling direction is `vertically` and the `proportional` parameter is `true`, the width will also expand by the same ratio of change as the height. With this setting, expanding a `32` x `16` sprite in the vertical direction to `32` pixels will also expand the width to `64`. The same ratio scaling will happen for the height if the direction is `horizontally`.

## Uniform scaling

When the scaling **direction** is set to `uniformly`, the sprite is scaled so that te new size will have both the width and height the same. If a sprite's current size is `64` x `16` and it's uniformly scaled to `128`, the new width and height will both be `128`.

## Parameters

* **sprite**: the sprite to scale to a pixel amount.
* **value**: the [number](/types/number) of pixels to scale the sprite to.
* **direction**: the direction to scale in:
>* `horizontally`
>* `vertically`
>* `uniformly`
* **anchor**: an anchor point to scale the sprite from:
>* `middle`
>* `top`
>* `left`
>* `right`
>* `bottom`
>* `top left`
>* `top right`
>* `bottom right`
>* `bottom left`
* **proportional**: a [boolean](/types/boolean) value that when `true` will scale the sprite proportionally. If `false`, the sprite will only scale by **direction**. This parameter has no effect when **direction** is set to `uniformly`.

## Example #example

### Scaling tester #ex1

Make a program to test sprite scaling in both directions for expanding and shrinking. Use the controller buttons to increase and decrease the scale. Use buttons to turn **proportional** to `true` or `false`.

```blocks
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    proportion = false
    game.showLongText("Proportional = FALSE", DialogLayout.Bottom)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    proportion = true
    game.showLongText("Proportional = TRUE", DialogLayout.Bottom)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPixels(mySprite, pixelMin, ScaleDirection.Horizontally, ScaleAnchor.Middle, proportion)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPixels(mySprite, pixelMax, ScaleDirection.Horizontally, ScaleAnchor.Middle, proportion)
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPixels(mySprite, pixelMax, ScaleDirection.Vertically, ScaleAnchor.Middle, proportion)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPixels(mySprite, pixelMin, ScaleDirection.Vertically, ScaleAnchor.Middle, proportion)
})
let proportion = false
let pixelMax = 0
let pixelMin = 0
let mySprite: Sprite = null
mySprite = sprites.create(img`
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 5 5 5 7 7 7 7 7 7 7 7 5 5 5 2 
    2 5 5 7 7 7 7 7 7 7 7 7 7 5 5 2 
    2 5 7 7 7 7 7 7 7 7 7 7 7 7 5 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 8 8 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 8 8 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 5 7 7 7 7 7 7 7 7 7 7 7 7 5 2 
    2 5 5 7 7 7 7 7 7 7 7 7 7 5 5 2 
    2 5 5 5 7 7 7 7 7 7 7 7 5 5 5 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    `, SpriteKind.Player)
pixelMin = mySprite.width
pixelMax = pixelMin * 5
game.showLongText("Proportional = FALSE", DialogLayout.Bottom)
```

### Uniformity tester #ex2

Test uniformly scaling a nonsquare sprite. Use the `up` and `down` controller buttons to increase and decrease the scale.

```blocks
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPixels(mySprite, pixelMax, ScaleDirection.Uniformly, ScaleAnchor.Middle)
    info.setScore(mySprite.width)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPixels(mySprite, pixelMin, ScaleDirection.Uniformly, ScaleAnchor.Middle)
    info.setScore(mySprite.width)
})
let pixelMax = 0
let pixelMin = 0
let mySprite: Sprite = null
mySprite = sprites.create(img`
    22222222222222222222222222222222
    25557777777777777777777777775552
    25577777777777777777777777777552
    25777777777777777777777777777752
    27777777777777777777777777777772
    27777777777777777777777777777772
    27777777777777777777777777777772
    27777777777777888877777777777772
    27777777777777888877777777777772
    27777777777777777777777777777772
    27777777777777777777777777777772
    27777777777777777777777777777772
    25777777777777777777777777777752
    25577777777777777777777777777552
    25557777777777777777777777775552
    22222222222222222222222222222222
    `, SpriteKind.Player)
pixelMin = mySprite.height
pixelMax = pixelMin * 5
info.setScore(mySprite.width)
```

## See also #seealso

[scale by pixels](/reference/sprites/scaling/scale-by-pixels)

```package
sprite-scaling
```

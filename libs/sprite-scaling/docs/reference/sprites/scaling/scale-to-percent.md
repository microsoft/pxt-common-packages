# scale To Percent

Scale a sprite to a percentage of its original size in a direction from an anchor point.

```sig
scaling.scaleToPercent(null, 100, ScaleDirection.Uniformly, ScaleAnchor.Middle)
```

A sprite can scale to a percentage of its original size in a direction from an anchor point. The scaling can be in just one direction or the sprite can scale uniformly.

## Uniform scaling

When the scaling **direction** is set to `uniformly`, the sprite is scaled so that the new size will have both the width and height changed by the same percentage **value**. If a sprite's original size is `64` x `32` and it's uniformly scaled to `50` percent, the new width is `32` and the new height is `16`.

## Parameters

* **sprite**: the sprite to scale to a percentage of its original size.
* **value**: the [number](/types/number) that is the percentage to scale the sprite to.
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

## Example #example

### Scaling tester #ex1

Make a program to test sprite scaling in both directions for expanding and shrinking. Use the controller buttons to increase and decrease the scale to a percentage of the original sprite by direction. Use button `A` to set the pixel back to its original size.

```blocks
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPercent(mySprite, 100, ScaleDirection.Uniformly, ScaleAnchor.Middle)
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPercent(mySprite, 200, ScaleDirection.Vertically, ScaleAnchor.Middle)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPercent(mySprite, 50, ScaleDirection.Horizontally, ScaleAnchor.Middle)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPercent(mySprite, 200, ScaleDirection.Horizontally, ScaleAnchor.Middle)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleToPercent(mySprite, 50, ScaleDirection.Vertically, ScaleAnchor.Middle)
})
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
```

## See also #seealso

[scale by percent](/reference/sprites/scaling/scale-by-percent)

```package
sprite-scaling
```

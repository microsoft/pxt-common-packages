# scale By Percent

Scale a sprite by a percentage of its current size in a direction from an anchor point.

```sig
scaling.scaleByPercent(null, 50, ScaleDirection.Uniformly, ScaleAnchor.Middle)
```

A sprite can scale by a percentage of its original size in a direction from an anchor point. The scaling can be in just one direction or the sprite can scale uniformly.

## Uniform scaling

When the scaling **direction** is set to `uniformly`, the sprite is scaled so that the new size will have both the width and height changed by the same percentage **value**. If a sprite's current size is `64` x `32` and it's uniformly scaled by `50` percent, the new width is `32` and the new height is `16`.

## Parameters

* **sprite**: the sprite to scale by a percentage of its original size.
* **value**: the [number](/types/number) that is the percentage to scale the sprite by.
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

Make a program to test sprite scaling a sprite by expanding and shrinking it uniformly. Use the controller buttons to increase and decrease the scale of a sprite  by a percentage of its current size.

```blocks
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleByPercent(mySprite, -50, ScaleDirection.Uniformly, ScaleAnchor.Middle)
    info.setScore(mySprite.width)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    scaling.scaleByPercent(mySprite, 50, ScaleDirection.Uniformly, ScaleAnchor.Middle)
    info.setScore(mySprite.width)
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
info.setScore(mySprite.width)
```

## See also #seealso

[scale to percent](/reference/sprites/scaling/scale-to-percent)

```package
sprite-scaling
```

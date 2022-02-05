# set Scale

Set the scale factor for a sprite based on an anchor point.

```sig
sprites.create(null).setScale(1, ScaleAnchor.Middle)
```

You can increase or decrease a sprite from it's current size to a new size by setting a scale value. If a sprite's scale is set to `2`, then the sprite's new size is two times larger than it's original size. The sprite's size will shrink if you give a negative value. If you use `-3` for the scale value, the sprite's new size will three times smaller than it's original size.

The **anchor** determines which direction the sprite will expand or shrink. If you increase the scale from the `middle`, the sprite will grow equally from it's center. If you choose to scale from the `bottom left`, the sprite will grow toward the top right of the screen.

## Parameters

* **value**: a [number](/types/number) that is the scale factor for the sprite.
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

## Examples #example

### Scale in 4 directions

Create a sprite with a square image. Make the sprite grow and shrink by `3` in each of the 4 corner directions.

```blocks
let scaleZone = 0
let mySprite = sprites.create(img`
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
game.onUpdateInterval(500, function () {
    if (scaleZone == 0) {
        mySprite.setScale(3, ScaleAnchor.TopLeft)
    } else if (scaleZone == 1) {
        mySprite.setScale(1, ScaleAnchor.TopLeft)
    } else if (scaleZone == 2) {
        mySprite.setScale(3, ScaleAnchor.TopRight)
    } else if (scaleZone == 3) {
        mySprite.setScale(1, ScaleAnchor.TopRight)
    } else if (scaleZone == 4) {
        mySprite.setScale(3, ScaleAnchor.BottomRight)
    } else if (scaleZone == 5) {
        mySprite.setScale(1, ScaleAnchor.BottomRight)
    } else if (scaleZone == 6) {
        mySprite.setScale(3, ScaleAnchor.BottomLeft)
    } else if (scaleZone == 7) {
        mySprite.setScale(1, ScaleAnchor.BottomLeft)
    } else {
        scaleZone = -1
    }
    scaleZone += 1
})
```

## See also #seealso

[change scale](/reference/sprites/sprite/change-scale)

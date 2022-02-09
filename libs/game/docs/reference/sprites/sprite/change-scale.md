# change Scale

Change the scale factor for a sprite by an increment or decrement.

```sig
sprites.create(null).changeScale(1, ScaleAnchor.Middle)
```

You can increase or decrease a sprite's size from it's current size by a certain amount. If a sprite's scale is `2` and you change it by `1`, then the sprite is now `3` times larger than it's original size. The sprite's size will shrink if you give a negative value. If you use `-2` for the change **value**, the sprite's new size will be half of what is was before.

The **anchor** determines which direction the sprite will expand or shrink. If you increase the scale from the `middle`, the sprite will grow equally from it's center. If you choose to scale from the `bottom left`, the sprite will grow toward the top right of the screen.

## Parameters

* **value**: a [number](/types/number) to change the sprite's scale by.
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

### Rescale sprite

Create a sprite with a square image. In a game update event, make the sprite grow and shrink continuously.

```blocks
let scaleFactor = 0
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
    if (mySprite.scale == 1) {
        scaleFactor = 1
    } else if (mySprite.scale == 7) {
        scaleFactor = -1
    }
    mySprite.changeScale(scaleFactor, ScaleAnchor.Middle)
})
```

## See also #seealso

[set scale](/reference/sprites/sprite/set-scale)

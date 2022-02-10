# sx (property)

Get or set the scaling factor for the width of a sprite.

## Get

Get the width scale for the sprite.

```block
let mySprite: Sprite = null

let xScale = mySprite.sx
```

```typescript-ignorelet
xScale = mySprite.sx
```

### Returns

* a [number](/types/number) that is the current scale for the width of the sprite.

## Set

Set the width scale for the sprite.

```block
let mySprite: Sprite = null

mySprite.sx = 2
```

```typescript-ignore
mySprite.sx = 2
```

### Parameter

* **value**: the new width scale factor for the size of the sprite.

## Examples #example

### Stretch and shrink width #ex1

Scale a sprite's width by `1` more size every second. Expand while it's small and contract when it's large.

```blocks
let expand = 0
let mySprite = sprites.create(img`
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 7 7 7 7 7 7 7 7 7 7 7 7 7 7 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    `, SpriteKind.Player)
game.onUpdateInterval(1000, function () {
    if (mySprite.sx == 1) {
        expand = 1
    } else if (mySprite.sx == 6) {
        expand = -1
    }
    mySprite.sx += expand
})
```

## See also #seealso

[sy](/reference/sprites/sprite/sy),
[scale](/reference/sprites/sprite/scale)

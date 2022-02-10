# scale (property)

Get or set the scaling factor for the width and height of a sprite.

## Get

Get the scale for the sprite.

```block
let mySprite: Sprite = null

let xScale = mySprite.scale
```

```typescript-ignorelet
xScale = mySprite.scale
```

### Returns

* a [number](/types/number) that is the current scale for the sprite.

## Set

Set the scale for the sprite.

```block
let mySprite: Sprite = null

mySprite.scale = 2
```

```typescript-ignore
mySprite.scale = 2
```

### Parameter

* **value**: the new scale factor for the size of the sprite.

## Examples #example

### Stretch and shrink size #ex1

Scale a sprite's size by `1` more every second. Expand while it's small and contract when it's large.

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
    if (mySprite.scale == 1) {
        expand = 1
    } else if (mySprite.scale == 6) {
        expand = -1
    }
    mySprite.scale += expand
})
```

## See also #seealso

[sx](/reference/sprites/sprite/sx),
[sy](/reference/sprites/sprite/sy)

# sy (property)

Get or set the scaling factor for the height of a sprite.

## Get

Get the height scale for the sprite.

```block
let mySprite: Sprite = null

let xScale = mySprite.sy
```

```typescript-ignorelet
xScale = mySprite.sy
```

### Returns

* a [number](/types/number) that is the current scale for the height of the sprite.

## Set

Set the height scale for the sprite.

```block
let mySprite: Sprite = null

mySprite.sy = 2
```

```typescript-ignore
mySprite.sy = 2
```

### Parameter

* **value**: the new height scale factor for the size of the sprite.

## Examples #example

### Stretch and shrink height #ex1

Scale a sprite's height by `1` more size every second. Expand while it's small and contract when it's large.

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
    if (mySprite.sy == 1) {
        expand = 1
    } else if (mySprite.sy == 6) {
        expand = -1
    }
    mySprite.sy += expand
})
```

## See also #seealso

[sx](/reference/sprites/sprite/sx),
[scale](/reference/sprites/sprite/scale)

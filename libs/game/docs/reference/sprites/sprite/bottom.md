# bottom (property)

Get or set the bottom position of the sprite on the screen.

## Get

Get the bottom position of the sprite.

```block
let mySprite: Sprite = null

let bottomPosition = mySprite.bottom
```

```typescript-ignore
let bottomPosition = mySprite.bottom
```

### Returns

* a [number](/types/number) that is the current bottom position of sprite object on the screen.

## Set

```block
let mySprite: Sprite = null

mySprite.bottom = 0
```

```typescript-ignore
mySprite.bottom = 0
```

### Parameter

* **value**: the new bottom position for the sprite object on the screen.

## Sprite locations

The sprite image forms a rectangle with some number of pixel rows. The **bottom** of the sprite is the vertical location of the last row of the sprite's pixels on the screen. The bottom of the sprite can have a value that is greater than the height of the screen. It can also have a value that is less than the top of the screen (the top is `0` and the value of the bottom side of the sprite in this case is negative). When this happens, some or all of the sprite isn't visible on the screen.

## Examples #example

### Side to side #ex1

Move a sprite to the top side of the screen. Wait 2 seconds and then move it to the bottom side.

```blocks
enum SpriteKind {
    Example
}
let mySprite: Sprite = null
mySprite = sprites.create(img`
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
7 7 2 2 2 2 2 2 2 2 2 2 2 2 7 7 
7 5 7 2 2 2 2 2 2 2 2 2 2 7 4 7 
7 5 5 7 2 2 2 2 2 2 2 2 7 4 4 7 
7 5 5 5 7 2 2 2 2 2 2 7 4 4 4 7 
7 5 5 5 5 7 2 2 2 2 7 4 4 4 4 7 
7 5 5 5 5 5 7 2 2 7 4 4 4 4 4 7 
7 5 5 5 5 5 5 7 7 4 4 4 4 4 4 7 
7 5 5 5 5 5 5 7 7 4 4 4 4 4 4 7 
7 5 5 5 5 5 7 8 8 7 4 4 4 4 4 7 
7 5 5 5 5 7 8 8 8 8 7 4 4 4 4 7 
7 5 5 5 7 8 8 8 8 8 8 7 4 4 4 7 
7 5 5 7 8 8 8 8 8 8 8 8 7 4 4 7 
7 5 7 8 8 8 8 8 8 8 8 8 8 7 4 7 
7 7 8 8 8 8 8 8 8 8 8 8 8 8 7 7 
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
`, SpriteKind.Example)
forever(function () {
    mySprite.top = 0
    pause(2000)
    mySprite.bottom = scene.screenHeight()
    pause(2000)
})
```

### Stay in bounds #ex2

Send a sprite moving from the bottom side of the screen to the top. In an ``||game:on game update||`` loop, check to see if the the sprite touched the top side of the screen. If so, reset the sprite back to the bottom side of the screen.

```blocks
enum SpriteKind {
    Example,
    Player,
    Enemy
}
let mySprite: Sprite = null
mySprite = sprites.create(img`
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
7 7 2 2 2 2 2 2 2 2 2 2 2 2 7 7 
7 5 7 2 2 2 2 2 2 2 2 2 2 7 4 7 
7 5 5 7 2 2 2 2 2 2 2 2 7 4 4 7 
7 5 5 5 7 2 2 2 2 2 2 7 4 4 4 7 
7 5 5 5 5 7 2 2 2 2 7 4 4 4 4 7 
7 5 5 5 5 5 7 2 2 7 4 4 4 4 4 7 
7 5 5 5 5 5 5 7 7 4 4 4 4 4 4 7 
7 5 5 5 5 5 5 7 7 4 4 4 4 4 4 7 
7 5 5 5 5 5 7 8 8 7 4 4 4 4 4 7 
7 5 5 5 5 7 8 8 8 8 7 4 4 4 4 7 
7 5 5 5 7 8 8 8 8 8 8 7 4 4 4 7 
7 5 5 7 8 8 8 8 8 8 8 8 7 4 4 7 
7 5 7 8 8 8 8 8 8 8 8 8 8 7 4 7 
7 7 8 8 8 8 8 8 8 8 8 8 8 8 7 7 
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
`, SpriteKind.Example)
mySprite.bottom = scene.screenHeight()
mySprite.vy = -40
game.onUpdateInterval(500, function () {
    if (mySprite.bottom < 0) {
        mySprite.bottom = scene.screenHeight()
        mySprite.say("Reset!", 500)
    }
})
```
## See also #seealso

[left](/reference/sprites/sprite/left),
[right](/reference/sprites/sprite/right),
[top](/reference/sprites/sprite/top),
[x](/reference/sprites/sprite/x),
[y](/reference/sprites/sprite/y)


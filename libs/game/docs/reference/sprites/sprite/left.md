# left (property)

Get or set the left position of the sprite on the screen.

## Get

Get the left position of the sprite.

```block
let mySprite: Sprite = null

let leftPosition = mySprite.left
```

```typescript-ignore
let leftPosition = mySprite.left
```

### Returns

* a [number](/types/number) that is the current left position of sprite object on the screen.

## Set

Set the left position of the sprite.

```block
let mySprite: Sprite = null

mySprite.left = 0
```

```typescript-ignore
mySprite.left = 0
```

### Parameter

* **value**: the new left position for the sprite object on the screen.

## Sprite locations

The sprite image forms a rectangle with some number of pixel columns. The **left** of the sprite is the horizontal location of the first column of the sprite's pixels on the screen. The left of the sprite can have a value that is greater than the width of the screen. It can also have a value that is less than the left side of the screen (the left of screen is `0` and the value of the left side of the sprite in this case is negative). When this happens, some or all of the sprite isn't visible on the screen.

## Examples #example

### Side to side #ex1

Move a sprite to the right side of the screen. Wait 2 seconds and then move it to the left side.

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
    mySprite.right = scene.screenWidth()
    pause(2000)
    mySprite.left = 0
    pause(2000)
})
```

### Stay in bounds #ex2

Send a sprite moving from the right side of the screen to the left. In an ``||game:on game update||`` loop, check to see if the the sprite touched the left side of the screen. If so, reset the sprite back to the right side of the screen.

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
mySprite.right = scene.screenWidth()
mySprite.vx = -40
game.onUpdateInterval(500, function () {
    if (mySprite.left < 0) {
        mySprite.right = scene.screenWidth()
        mySprite.say("Reset!", 500)
    }
})

```
## See also #seealso

[right](/reference/sprites/sprite/right),
[top](/reference/sprites/sprite/top),
[bottom](/reference/sprites/sprite/bottom),
[x](/reference/sprites/sprite/x),
[y](/reference/sprites/sprite/y)

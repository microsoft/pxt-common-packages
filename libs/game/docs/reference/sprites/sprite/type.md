# type (property)

Get or set the type of sprite kind.

## Get

Get the sprite kind type.

```block
let mySprite: Sprite = null

let myKind = mySprite.type
```

```typescript-ignore
let myKind = mySprite.type
```

### Returns

* a [number](/types/number) that is the current sprite kind type.

## Set

```block
let mySprite: Sprite = null

mySprite.type = 0
```

```typescript-ignore
mySprite.type = 0
```

### Parameter

* **value**: the new kind type to set for the sprite.


## Sprite kinds

To keep track of different types of sprites, you can assign a _kind_ to them. This is a value that will help identify them and decide what actions to take when events happen in the game. There are no particular rules or names for how you decide on what the kinds should be. A good way to do it though is to make an enumerated list of kinds like this:

```typescript
enum SpriteKind {
    Player,
    Enemy
}
```

Then, when you create a sprite, you can optionally assign it a kind:

```block
enum SpriteKind {
    Player,
    Enemy
}
let mySprite = sprites.create(img`
2 4
4 2
`, SpriteKind.Player)
```

```typescript-ignore
let mySprite = sprites.create(img`
2 4
4 2
`, SpriteKind.Player)
```

If you were making a space game, you might have kinds like this:

```typescript
enum SpriteKind {
    Ship,
    Planet,
    Asteroid,
    Moon
}
```


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

enum SpriteKind {
    Circle,
    Square,
    Player,
    Enemy
}
let shape2: Sprite = null
let shape1: Sprite = null
sprites.onOverlap(SpriteKind.Square, SpriteKind.Circle, function (sprite, otherSprite) {
    otherSprite.x = scene.screenWidth() / 2
    otherSprite.y = scene.screenHeight() / 2
})
shape1 = sprites.create(img`
. . . . . . . . . . . . . . . 1 . . . . . . . . . . . . . . . . 
. . . . . . . . . . . 1 1 1 1 5 1 1 1 1 . . . . . . . . . . . . 
. . . . . . . . . 1 1 5 5 5 5 5 5 5 5 5 1 1 . . . . . . . . . . 
. . . . . . . 1 1 5 5 5 5 5 5 5 5 5 5 5 5 5 1 1 . . . . . . . . 
. . . . . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . . . . 
. . . . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . . . 
. . . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . . 
. . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . 
. . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . 
. . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . 
. . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
. 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . 
. . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . 
. . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . 
. . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . 
. . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . 
. . . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . . 
. . . . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . . . 
. . . . . . 1 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 1 . . . . . . . 
. . . . . . . 1 1 5 5 5 5 5 5 5 5 5 5 5 5 5 1 1 . . . . . . . . 
. . . . . . . . . 1 1 5 5 5 5 5 5 5 5 5 1 1 . . . . . . . . . . 
. . . . . . . . . . . 1 1 1 1 5 1 1 1 1 . . . . . . . . . . . . 
. . . . . . . . . . . . . . . 1 . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
`, SpriteKind.Circle)
shape2 = sprites.create(img`
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
`, SpriteKind.Square)
shape1.vx = 40
shape1.vy = 40
shape2.vx = -80
shape2.vy = -80
game.onUpdateInterval(50, function () {
    if (shape1.left < 0 || shape1.right > scene.screenWidth()) {
        shape1.vx = shape1.vx * -1
    }
    if (shape2.left < 0 || shape2.right > scene.screenWidth()) {
        shape2.vx = shape2.vx * -1
    }
    if (shape1.top < 0 || shape1.bottom > scene.screenHeight()) {
        shape1.vy = shape1.vy * -1
    }
    if (shape2.top < 0 || shape2.bottom > scene.screenHeight()) {
        shape2.vy = shape2.vy * -1
    }
})

## See also #seealso

[right](/reference/sprites/sprite/right),
[top](/reference/sprites/sprite/top),
[bottom](/reference/sprites/sprite/bottom),
[x](/reference/sprites/sprite/x),
[y](/reference/sprites/sprite/y)

# ax (property)

Get or set the horizontal acceleration for a sprite in pixels per second, per second.

## Get

Get the horizontal acceleration of the sprite.

```block
let mySprite: Sprite = null

let horzAccel = mySprite.ax
```

```typescript-ignorelet
horzAccel = mySprite.ax
```

### Returns

* a [number](/types/number) that is the current horizontal acceleration of the sprite.

## Set

```block
let mySprite: Sprite = null

mySprite.ax = 0
```

```typescript-ignore
mySprite.ax = 0
```

### Parameter

* **value**: the new horizontal acceleration for the sprite in pixels per second, per second.

## Sprite acceleration

Acceleration of a sprite makes it speed up or slow down. The value for acceleration determines how quickly the speed  of the sprite will change. A positive value makes the sprite speed up as it moves. A negative value causes the sprite to slow down while it moves.

### ~ hint

**How speed changes**

Speed, or velocity, is how much distance an object moves during some period of time. Distance in your game is measured in pixels so the speed of a sprite is in _pixels per second_. Speed is changed by _accelerating_ an object. In your game, a sprite is accelerated by some amount of change in speed per second. So, acceleration is measured in _pixels per second per second_.

If the speed of a sprite is currently at `0` and it's acceleration is set to `2`, the sprite will be moving at a speed of 2 pixels per second after one second of time. After two seconds the sprite is moving at 4 pixels per second and so on.

### ~

## Examples #example

### Go to each side #ex1

Accelerate a a sprite as it moves from the left side of the screen to the right side and back.

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
mySprite.left = 0
mySprite.vx = 0
mySprite.ax = 10
game.onUpdateInterval(500, function () {
    if (mySprite.x < 0 || mySprite.x > scene.screenWidth()) {
        mySprite.vx = mySprite.vx * -1
        mySprite.ax = mySprite.ax * -1

    }
})

```

### How fast was it? #ex2

Accelerate a sprite at `100` starting with a speed of `0`. Check after about `1` second and see how fast the sprite was travelling.

```blocks
enum SpriteKind {
    Example,
    Player,
    Enemy
}
let interval = 0
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
mySprite.left = 0
mySprite.vx = 0
mySprite.ax = 100
game.onUpdateInterval(1000, function () {
    if (interval == 1) {
        mySprite.say("My speed is " + mySprite.vx + " pixels/sec")
        mySprite.ax = 0
        mySprite.vx = 0
    }
    interval += 1
})
```

## See also #seealso

[ay](/reference/sprites/sprite/ay),
[vx](/reference/sprites/sprite/vx),
[vy](/reference/sprites/sprite/vy)

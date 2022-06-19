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

## Sprite horizontal acceleration

The value for acceleration determines how quickly the speed of the sprite will change. Acceleration of a sprite makes it speed up in a direction toward the right or left. A positive value causes the sprite's speed in the `right` direction to increase. A negative value causes the sprite's speed in the `left` direction to increase.

Acceleration can be used as an opposing force too. If a sprite is travelling toward the right at a certain speed and a negative horizontal acceleration is applied, the sprite will keep moving to the right but it will slow down. When the sprite's speed reaches `0`, the sprite will begin to move to the left.

### ~ hint

#### How speed changes

Speed, or velocity, is how much distance an object moves during some period of time. Distance in your game is measured in pixels so the speed of a sprite is in _pixels per second_. Speed is changed by _accelerating_ an object. In your game, a sprite is accelerated by some amount of change in speed per second. So, acceleration is measured in _pixels per second per second_.

If the speed of a sprite is currently at `0` and it's acceleration is set to `2`, the sprite will be moving at a speed of 2 pixels per second after one second of time. After two seconds the sprite is moving at 4 pixels per second and so on.

### ~

## Examples #example

### Go to each side #ex1

Accelerate a a sprite as it moves from the left side of the screen to the right side and back.

```blocks
namespace SpriteKind {
    export const Example = SpriteKind.create()
}
let mySprite = sprites.create(img`
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
namespace SpriteKind {
    export const Example = SpriteKind.create()
}
let interval = 0
let mySprite = sprites.create(img`
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

### Opposite force #ex3

Make a sprite move from the left side of the screen to the right side. Apply acceleration in the opposite direction to slow the sprite down and send back to the left.

```blocks
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
mySprite.setStayInScreen(true)
mySprite.left = 0
mySprite.vx = 100
mySprite.ax = -35
```

## See also #seealso

[ay](/reference/sprites/sprite/ay),
[vx](/reference/sprites/sprite/vx),
[vy](/reference/sprites/sprite/vy)

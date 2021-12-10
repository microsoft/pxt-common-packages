# ay (property)

Get or set the vertical acceleration for a sprite in pixels per second, per second.

## Get

Get the vertical acceleration of the sprite.

```block
let mySprite: Sprite = null

let horzAccel = mySprite.ay
```

```typescript-ignorelet
horzAccel = mySprite.ay
```

### Returns

* a [number](/types/number) that is the current vertical acceleration of the sprite.

## Set

```block
let mySprite: Sprite = null

mySprite.ay = 0
```

```typescript-ignore
mySprite.ay = 0
```

### Parameter

* **value**: the new vertical acceleration for the sprite in pixels per second, per second.

## Sprite vertical acceleration

The value for acceleration determines how quickly the speed of the sprite will change. Acceleration of a sprite makes it speed up in a direction toward the bottom or top. A positive value causes the sprite's speed in the `bottom` direction to increase. A negative value causes the sprite's speed in the `top` direction to increase.

Acceleration can be used as an opposing force too. If a sprite is travelling toward the bottom at a certain speed and a negative vertical acceleration is applied, the sprite will keep moving to the bottom but it will slow down. When the sprite's speed reaches `0`, the sprite will begin to move to the top.


### ~ hint

#### How speed changes

Speed, or velocity, is how much distance an object moves during some period of time. Distance in your game is measured in pixels so the speed of a sprite is in _pixels per second_. Speed is changed by _accelerating_ an object. In your game, a sprite is accelerated by some amount of change in speed per second. So, acceleration is measured in _pixels per second per second_.

If the speed of a sprite is currently at `0` and it's acceleration is set to `2`, the sprite will be moving at a speed of 2 pixels per second after one second of time. After two seconds the sprite is moving at 4 pixels per second and so on.

### ~

## Examples #example

### Go to each side #ex1

Accelerate a a sprite as it moves from the top side of the screen to the bottom side and back.

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
mySprite.top = 0
mySprite.vy = 0
mySprite.ay = 10
game.onUpdateInterval(500, function () {
    if (mySprite.y < 0 || mySprite.y > scene.screenHeight()) {
        mySprite.vy = mySprite.vy * -1
        mySprite.ay = mySprite.ay * -1

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
mySprite.top = 0
mySprite.vy = 0
mySprite.ay = 100
game.onUpdateInterval(1000, function () {
    if (interval == 1) {
        mySprite.say("My speed is " + mySprite.vy + " pixels/sec")
        mySprite.ay = 0
        mySprite.vy = 0
    }
    interval += 1
})
```
### Opposite force #ex3

Make a sprite move from the top of the screen to the bottom. Apply acceleration in the opposite direction to slow the sprite down and send back to the top.

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
mySprite.top = 0
mySprite.vy = 80
mySprite.ay = -35
```

## See also #seealso

[ax](/reference/sprites/sprite/ax),
[vx](/reference/sprites/sprite/vx),
[vy](/reference/sprites/sprite/vy)

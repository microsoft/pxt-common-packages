# fx (property)

Get or set the friction opposing a sprite's motion in the horizontal direction.

## Get

Get the horizontal friction on the sprite.

```block
let mySprite: Sprite = null

let horzAccel = mySprite.fx
```

```typescript-ignorelet
horzAccel = mySprite.fx
```

### Returns

* a [number](/types/number) that is the current horizontal friction of the sprite.

## Set

Set the horizontal friction for the sprite.

```block
let mySprite: Sprite = null

mySprite.fx = 0
```

```typescript-ignore
mySprite.fx = 0
```

### Parameter

* **value**: the new horizontal friction opposing the sprite's motion in pixels per second, per second.

## Sprite horizontal friction

Friction is an opposing force against the motion of a sprite. If a sprite has a horizontal velocity (`vx`), it's friction will slow the sprite down until it's horizontal velocity becomes `0`. This is similar to setting an opposite horizontal acceleration but the opposite acceleration goes away once the sprite stops.

## Examples #example

### Measure stopping time #ex1

Move the sprite from left to right across the screen. Use the correct amount of friction (`fx`) to make the sprite stop at `3` seconds.

```blocks
let stopTime = 0
let counting = true
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
mySprite.fx = 30
mySprite.vx = 90
game.onUpdateInterval(100, function () {
    if (counting) {
        stopTime += 0.1
        if (mySprite.vx == 0) {
            counting = false
            mySprite.sayText("" + stopTime + "sec", 5000, false)
        }
    }
})
```

### Skipping sprite #ex2

Make a sprite move from the left to the right. Make it skip to the right once every second.

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
mySprite.fx = 80
mySprite.vx = 80
for (let index = 0; index < 3; index++) {
    mySprite.vx = 80
    pause(1000)
}
```

## See also #seealso

[fy](/reference/sprites/sprite/fy),
[ax](/reference/sprites/sprite/ax)

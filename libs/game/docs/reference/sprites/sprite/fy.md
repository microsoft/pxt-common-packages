# fy (property)

Get or set the friction opposing a sprite's motion in the vertical direction.

## Get

Get the vertical friction on the sprite.

```block
let mySprite: Sprite = null

let horzAccel = mySprite.fy
```

```typescript-ignorelet
horzAccel = mySprite.fy
```

### Returns

* a [number](/types/number) that is the current vertical friction of the sprite.

## Set

Set the vertical friction for the sprite.

```block
let mySprite: Sprite = null

mySprite.fy = 0
```

```typescript-ignore
mySprite.fy = 0
```

### Parameter

* **value**: the new vertical friction opposing the sprite's motion in pixels per second, per second.

## Sprite vertical friction

Friction is an opposing force against the motion of a sprite. If a sprite has a vertical velocity (`vy`), it's friction will slow the sprite down until it's vertical velocity becomes `0`. This is similar to setting an opposite vertical acceleration but the opposite acceleration goes away once the sprite stops.

## Examples #example

### Measure stopping time #ex1

Move the sprite from top to bottom across the screen. Use the correct amount of friction (`fy`) to make the sprite stop at `3` seconds.

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
mySprite.top = 0
mySprite.fy = 20
mySprite.vy = 60
game.onUpdateInterval(100, function () {
    if (counting) {
        stopTime += 0.1
        if (mySprite.vy == 0) {
            counting = false
            mySprite.sayText("" + stopTime + "sec", 5000, false)
        }
    }
})
```

### Skipping sprite #ex2

Make a sprite move from the top to the bottom. Make it skip to the right once every second.

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
mySprite.fy = 60
mySprite.vy = 60
for (let index = 0; index < 3; index++) {
    mySprite.vy = 60
    pause(1000)
}
```

## See also #seealso

[fx](/reference/sprites/sprite/fx),
[ay](/reference/sprites/sprite/ay)

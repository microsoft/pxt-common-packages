# vx (property)

Get or set the horizontal speed of motion for a sprite in pixels per second.

## Get

Get the horizontal speed of the sprite.

```block
let mySprite: Sprite = null

let horzSpeed = mySprite.vx
```
```typescript-ignorelet
horzSpeed = mySprite.vx
```

### Returns

* a [number](/types/number) that is the current horizontal speed of the sprite in pixels per second.

## Set

```block
let mySprite: Sprite = null

mySprite.vx = 0
```

```typescript-ignore
mySprite.vx = 0
```

### Parameter

* **value**: the new horizontal speed for the sprite in pixels per second.

## Sprite motion

A sprite that isn't a projectile has no motion when it's created. You make the sprite move by setting it's speed, or _velocity_, in the **x** direction, the **y** direction, or both. For the **x** direction, setting the speed to a positive value makes the sprite move to the right. To make the sprite move to the left, you use a negative speed value.

If you don't follow the sprite with the _camera_ or check for when the sprite reaches the end of the screen, the sprite will move off the screen.

### ~ hint

**What is speed, really?**

Speed, or velocity, is how much distance an object moves during some period of time. A car can travel 50 kilometers in one hour so it moves at 50 kilometers per hour (50 km/h). A jet airplane can fly as fast as 913 k/mh and travel across some continents in 3 or 4 hours.

Distance in your game is measured in pixels so the speed of a sprite is in _pixels per second_. If the screen is 160 pixels wide, then a sprite with a speed of 40 pixels per second will move across the screen in 4 seconds.

### ~

## Examples #example

### Go to each side

Send a sprite moving to the right at `40` pixels per second. When it reaches the right side of the screen, send it back to the left side.

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
mySprite.vx = 40
game.onUpdateInterval(500, function () {
	if (mySprite.x < 0 || mySprite.x > scene.screenWidth()) {
        mySprite.vx = mySprite.vx * -1
    }
})
```

### How many pixels travelled?

Set a sprite in motion. Check after about `1` second and see how far the sprite has travelled.

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
mySprite.vx = 60
game.onUpdateInterval(1000, function () {
    if (interval == 1) {
        mySprite.vx = 0
        mySprite.say("I went " + mySprite.left + " pixels")
    }
    interval += 1
})
```

## See also #seealso

[vy](/reference/sprites/sprite/vy),
[camera follow sprite](/reference/scene/camera-follow-sprite)
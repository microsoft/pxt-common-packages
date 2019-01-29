# create Projectile From Side

Create a projectile sprite that moves from the side of the screen.

```sig
sprites.createProjectileFromSide(img``, 0, 0)
```

A projectile is a sprite the moves from the location where it's created at. It moves with a speed (velocity) that you set in both the horizontal and veritcal directions.

The motion of the projectile begins at an edge or corner of the screen. This is determined by both the speed value and its direction (negative or positive speed). If ``vx`` (horizontal speed) is has a positive value and ``vy`` (vertical speed) is `0`, the sprite will begin at the center of the left side of the screen. Similarly, if ``vy`` is positive and ``vx`` is `0`, the projectile motion begins at the top center of the screen.

If both ``vx`` and ``vy`` are not `0`, the projectile begins at a corner of the screen. When the ``vx`` value is positive, the projectile has left-to-right motion. Also, if ``vy`` is positive then the projectile has top-to-bottom motion. Giving ``vx`` a negative speed value moves the projectile right-to-left and giving ``vy`` a negative value moves the projectile bottom-to-top.

The projectile is created with no motion and is placed at the center of the screen if both the ``vx`` and ``vy`` values are `0`.

The projectile has all the same properties that a non-moving sprite has. It will overlap with other sprites and hit, or collide, with tiles.

Projectiles have their sprite ``kind`` set as `1`. When using a ``SpriteKind`` enumeration, ``Projectile`` should be the second value in the enumeration order:

```typescript
enum SpriteKind {
    Player,
    Projectile,
    Food,
    Enemy
}
```

Projectiles are destroyed when they move off of the screen.

## Parameters

* **img**: an [image](/types/image) to create the projectile for.
* **vx**: the speed in the horizontal direction for the sprite to move at.
* **vy**: the speed in the vertical direction for the sprite to move at.

## Returns

* a new projectile [sprite](/types/sprite) that moves with a set velocity.

## Examples #example

### Go Smiley #ex1

Send a smiley sprite from the right side of the screen to the left side.

```blocks
let smiley: Sprite = null
smiley = sprites.createProjectileFromSide(img`
. . . . . f f f f f f f . . . . 
. . . f f e e e e e e e f . . . 
. . f e e e e e e e e e e f . . 
. f e e e e e e e e e e e e f . 
f e e e e f f e e e f f e e e f 
f e e e e f f e e e f f e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e e e e f e e e e e e f 
f e e e e e e e e e e e e e e f 
f e e e e f e e e e e f e e e f 
f e e e e e f f f f f e e e e f 
. f e e e e e e e e e e e e f . 
. . f e e e e e e e e e e f . . 
. . . f f e e e e e e e f . . . 
. . . . . f f f f f f f . . . . 
`, -50, 0)
```

### Asteroid Crunch #ex2

Send a projectile asteroid from the left side of the screen toward a stationary asteroid. 
Check for overlaps of a projectile with a player sprite. When a projectile touches a player sprite, make the player sprite disintegrate.

```blocks
enum SpriteKind {
    Player,
    Projectile,
    Food,
    Enemy
}
let mySprite: Sprite = null
let projectile: Sprite = null
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Player, function (sprite, otherSprite) {
    otherSprite.say("crunch", 500)
    otherSprite.startEffect(effects.disintegrate, 500)
})
projectile = sprites.createProjectileFromSide(img`
    . . . . . . . . c c c c . . . .
    . . . . c c c c c c c c c . . .
    . . . c f c c a a a a c a c . .
    . . c c f f f f a a a c a a c .
    . . c c a f f c a a f f f a a c
    . . c c a a a a b c f f f a a c
    . c c c c a c c b a f c a a c c
    c a f f c c c a b b 6 b b b c c
    c a f f f f c c c 6 b b b a a c
    c a a c f f c a 6 6 b b b a a c
    c c b a a a a b 6 b b a b b a .
    . c c b b b b b b b a c c b a .
    . . c c c b c c c b a a b c . .
    . . . . c b a c c b b b c . . .
    . . . . c b b a a 6 b c . . . .
    . . . . . . b 6 6 c c . . . . .
`, 50, 0)
mySprite = sprites.create(img`
    . . . . . . . . . c c 8 . . . .
    . . . . . . 8 c c c f 8 c c . .
    . . . c c 8 8 f c a f f f c c .
    . . c c c f f f c a a f f c c c
    8 c c c f f f f c c a a c 8 c c
    c c c b f f f 8 a c c a a a c c
    c a a b b 8 a b c c c c c c c c
    a f c a a b b a c c c c c f f c
    a 8 f c a a c c a c a c f f f c
    c a 8 a a c c c c a a f f f 8 a
    . a c a a c f f a a b 8 f f c a
    . . c c b a f f f a b b c c 6 c
    . . . c b b a f f 6 6 a b 6 c .
    . . . c c b b b 6 6 a c c c c .
    . . . . c c a b b c c c . . . .
    . . . . . c c c c c c . . . . .
`, SpriteKind.Player)
```

## See also #seealso

[create projectile](/reference/sprites/create-projectile),
[create projectile from sprite](/reference/sprites/create-projectile-from-sprite)

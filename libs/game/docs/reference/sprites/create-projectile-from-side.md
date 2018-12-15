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

## See also #seealso

[create projectile](/reference/sprites/create-projectile),
[create projectile from sprite](/reference/sprites/create-projectile-from-sprite)

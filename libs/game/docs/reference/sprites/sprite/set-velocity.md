# set Velocity

Set the horizontal and vertical velocities of a sprite.

```sig
sprites.create(null).setVelocity(0, 0)
```

Sprites that aren't projectiles are created without any motion. Every sprite has `vx` and `vy` properties which are its horizontal and vertical speeds.
You can set both of the speeds at once to make a sprite move in any direction.

## Parameters

* **vx**: the new horizontal velocity (speed) for the sprite.
* **vy**: the new vertical velocity (speed) for the sprite.

## Example #example

Create a sprite to bounce off the sides of the screen. Set the **vx** and **vy**
velocities to `50`.

```blocks
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
`, SpriteKind.Player)
mySprite.setFlag(SpriteFlag.BounceOnWall, true)
mySprite.setVelocity(50, 50)
```

## See also #seealso

[vx](/reference/sprites/sprite/vx),
[vy](/reference/sprites/sprite/vy)

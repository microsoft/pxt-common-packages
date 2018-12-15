# create Projectile From Sprite

Create a new projectile that starts from an existing sprite.

```sig
sprites.createProjectileFromSprite(img``, null, 0, 0)
```

The projectile is a sprite the moves from the center postition of another sprite. This creates the effect of some object leaving from a sprite image. It moves with a speed (velocity) that you set in both the horizontal and veritcal directions.

The projectile has all the same properties that a non-moving sprite has. It will overlap with other sprites and hit, or collide, with tiles.

Projectiles are destroyed when they move off of the screen.

## Parameters

* **img**: an [image](/types/image) to create the projectile for.
* **sprite**: the [sprite](/types/sprite) that the projectile will start from.
* **vx**: the speed in the horizontal direction for the sprite to move at.
* **vy**: the speed in the vertical direction for the sprite to move at.

## Returns

* a new projectile [sprite](/types/sprite) that moves with a set velocity.

## Examples #example

### Photon blaster #ex1

Send photons out of a spaceship when the ``B`` button is pressed.

```blocks
enum SpriteKind {
    Player,
    Enemy,
    Photon
}
let photon: Sprite = null

let ship = sprites.create(img`
. . . . . b b b b b b b b b b . . . . . . . . . . .
b b b b b b d d d d d d d d b b b b . . . . . . . .
b b d d d d d d d d d d d d d d d b b b b . . . . .
. b d d d d d f f f f f f d d d d d d d b b b b . .
. b d d d d d d d d d d d d d d d f f d d d d b b .
. b b d d d d d d d d d d d d d d f f d d d d d b b
. . b d d d f f f f f f f f f d d d d d d d d b b .
. . b d d d d d d d d d d d d d d d d b b b b b . .
. b b d d d d d d d d d d d d d b b b b . . . . . .
. b d d d d d d d d d d b b b b . . . . . . . . . .
b b d d b b b b b d b b b . . . . . . . . . . . . .
b b b b b . . . b b b . . . . . . . . . . . . . . .
`, SpriteKind.Player)
ship.x = 20
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    photon = sprites.createProjectileFromSprite(img`
. . . . . . 1 1 1 . .
. . . 1 1 1 1 1 1 1 .
1 1 1 1 1 1 1 1 1 1 1
. . . 1 1 1 1 1 1 1 .
. . . . . . 1 1 1 . .
`, ship, 150, 0)
})
```

## See also #seealso

[create](/reference/sprites/create),
[create projectile](/reference/sprites/create-projectile),
[create projectile from side](/reference/sprites/create-projectile-from-side)
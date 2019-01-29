# create Projectile From Sprite

Create a new projectile that starts from an existing sprite.

```sig
sprites.createProjectileFromSprite(img``, null, 0, 0)
```

The projectile is a sprite the moves from the center postition of another sprite. This creates the effect of some object leaving from a sprite image. It moves with a speed (velocity) that you set in both the horizontal and veritcal directions.

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
* **sprite**: the [sprite](/types/sprite) that the projectile will start from.
* **vx**: the speed in the horizontal direction for the sprite to move at.
* **vy**: the speed in the vertical direction for the sprite to move at.

## Returns

* a new projectile [sprite](/types/sprite) that moves with a set velocity.

## Examples #example

### Photon blaster #ex1

Send photon projectiles from a spaceship when the ``B`` button is pressed. The photons will eventually blast away the asteroid at the other side of the screen.

```blocks
enum SpriteKind {
    Player,
    Projectile,
    Food,
    Enemy,
    Asteroid
}
let asteroid: Sprite = null
let ship: Sprite = null
let shots = 0
let photon: Sprite = null

ship = sprites.create(img`
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
controller.moveSprite(ship, 0, 20)
asteroid = sprites.create(img`
    . . . . . . . c c c a c . . . .
    . . c c b b b a c a a a c . . .
    . c c a b a c b a a a b c c . .
    . c a b c f f f b a b b b a . .
    . c a c f f f 8 a b b b b b a .
    . c a 8 f f 8 c a b b b b b a .
    c c c a c c c c a b c f a b c c
    c c a a a c c c a c f f c b b a
    c c a b 6 a c c a f f c c b b a
    c a b c 8 6 c c a a a b b c b c
    c a c f f a c c a f a c c c b .
    c a 8 f c c b a f f c b c c c .
    . c b c c c c b f c a b b a c .
    . . a b b b b b b b b b b b c .
    . . . c c c c b b b b b c c . .
    . . . . . . . . c b b c . . . .
`, SpriteKind.Asteroid)
asteroid.right = scene.screenWidth() - 5
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    photon = sprites.createProjectileFromSprite(img`
        . . . . . . 1 1 1 . .
        . . . 1 1 1 1 1 1 1 .
        1 1 1 1 1 1 1 1 1 1 1
        . . . 1 1 1 1 1 1 1 .
        . . . . . . 1 1 1 . .
    `, ship, 150, 0)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Asteroid, function (sprite, otherSprite) {
    if (shots > 5) {
        otherSprite.startEffect(effects.disintegrate, 500)
    } else {
        shots += 1
    }
})
```

## See also #seealso

[create](/reference/sprites/create),
[create projectile](/reference/sprites/create-projectile),
[create projectile from side](/reference/sprites/create-projectile-from-side)
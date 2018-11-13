# create Projectile

Create a new sprite with motion from a pixel image.

```sig
sprites.createProjectile(img``, 0, 0, 0)
```

A projectile is a sprite the moves from the location where it's created at. It moves with a speed (velocity), that you set in both the horizontal and veritcal directions. The sprite starts at the screen coordinate of (0, 0) unless you tell it to come from another sprite. If you do that, the projectile will start from the center of sprite you set as the source.

The projectile has all the same properties that a non-moving sprite has. It will overlap with other sprites and hit collide with tiles.

Projectiles are destroyed when they move off of the screen.

## Parameters

* **img**: an [image](/types/image) to create a sprite for.
* **vx**: the speed in the horizontal direction for the sprite to move at.
* **vy**: the speed in the vertical direction for the sprite to move at.
* **kind**: the type of sprite to create - ``Player``, ``Enemy``, etc.
* **sprite**: an optional [sprite](/types/sprite) to project from.

## Returns

* a new game [sprite](/types/sprite) that moves with a set velocity.

## Examples #example

### Smiley dash #ex1

Send a smiley sprite from one corner of the screen to the other.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let smiley: Sprite = null
let xSpeed = 50
let ySpeed = xSpeed * scene.screenHeight() / scene.screenWidth()
smiley = sprites.createProjectile(img`
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
`, xSpeed, ySpeed, SpriteKind.Player)
```

### Photon blaster

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
    photon = sprites.createProjectile(img`
. . . . . . 1 1 1 . .
. . . 1 1 1 1 1 1 1 .
1 1 1 1 1 1 1 1 1 1 1
. . . 1 1 1 1 1 1 1 .
. . . . . . 1 1 1 . .
`, 150, 0, SpriteKind.Photon, ship)
})
```

## See also #seealso

[create](/reference/sprites/create)
# create Projectile From Sprite

Create a new motion sprite that starts from the center of another sprite.

```sig
sprites.createProjectileFromSprite(img`.`, null, 50, 50)
```

A projectile is a motion sprite that moves from the location it's created at. It moves with speeds (velocities `vx` and `vy`) that you set in both the horizontal and vertical directions.

The projectile sprite starts from the center of a `sprite` that you set for it. The `vx` and `vy` velocities have either positive or negative values which determine the direction that the projectile moves in.

The projectile has many of the same properties that a non-moving sprite has. It will overlap with other sprites, hit and overlap tiles.

Projectiles are destroyed when they move off of the screen.

## Parameters

* **img**: an [image](/types/image) for the projectile sprite.
* **sprite**: the [sprite](/types/sprite) to start the projectile from.
* **vx**: the speed in the horizontal direction for the sprite to move at.
* **vy**: the speed in the vertical direction for the sprite to move at.

## Returns

* a new projectile [sprite](/types/sprite) that moves with set velocities.

## Examples #example

### Send projectiles out of the box #ex1

Create a sprite in the shape of a box. Send projectiles out in random directions from the center of the box.

```blocks
let projectile: Sprite = null
let mySprite = sprites.create(img`
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 . . . . . . . . . . . . . . 2 
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
    `, SpriteKind.Player)
game.onUpdateInterval(1000, function () {
    projectile = sprites.createProjectileFromSprite(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . 8 8 8 8 . . . . . . 
        . . . . . 8 8 8 8 8 8 . . . . . 
        . . . . . 8 8 a a 8 8 . . . . . 
        . . . . . 8 8 a a 8 8 . . . . . 
        . . . . . 8 8 8 8 8 8 . . . . . 
        . . . . . . 8 8 8 8 . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, mySprite, randint(-50, 50), randint(-50, 50))
})
```

### Photon blaster #ex2

Send photons from a spaceship when the ``B`` button is pressed.

```blocks
let photon: Sprite = null
let target = sprites.create(img`
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    e e e e e e e . . . . . . . . . 
    `, SpriteKind.Enemy)
let ship = sprites.create(img`
    .....bbbbbbbbbb...........
    bbbbbbddddddddbbbb........
    bbdddddddddddddddbbbb.....
    .bdddddffffffdddddddbbbb..
    .bdddddddddddddddffddddbb.
    .bbddddddddddddddffdddddbb
    ..bdddfffffffffddddddddbb.
    ..bddddddddddddddddbbbbb..
    .bbdddddddddddddbbbb......
    .bddddddddddbbbb..........
    bbddbbbbbdbbb.............
    bbbbb...bbb...............
    `, SpriteKind.Player)
ship.x = 20
target.x = scene.screenWidth() - 10
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    photon = sprites.createProjectileFromSprite(img`
        . . . . . . 1 1 1 . . 
        . . . 1 1 1 1 1 1 1 . 
        1 1 1 1 1 1 1 1 1 1 1 
        . . . 1 1 1 1 1 1 1 . 
        . . . . . . 1 1 1 . . 
        `, ship, 150, 0)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprite.startEffect(effects.disintegrate, 100)
})
```

## See also #seealso

[create](/reference/sprites/create), [create projectile from side](/reference/sprites/create-projectile-from-side)
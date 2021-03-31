# create Projectile From Side

Create a new motion sprite that starts at the side of the screen.

```sig
sprites.createProjectileFromSide(img`.`, 50, 50)
```

A projectile is a motion sprite that moves from the location it's created at. It moves with speeds (velocities `vx` and `vy`) that you set in both the horizontal and vertical directions.

The side of the screen that the projectile starts from depends on the direction of the velocity values it's given. The `vx` and `vy` velocities have either positive or negative values which determine the direction. The projectile starts from a side of the screen based on the velocity direction shown in the following table.

|Side|vx|vy|
|-|-|-|
|upper left|positive|positive|
|lower left|positive|negative|
|upper right|negative|positive|
|lower right|negative|negative|
<br/>

The projectile has many of the same properties that a non-moving sprite has. It will overlap with other sprites, hit and overlap tiles.

Projectiles are destroyed when they move off of the screen.

## Parameters

* **img**: an [image](/types/image) for the projectile sprite.
* **vx**: the speed in the horizontal direction for the sprite to move at.
* **vy**: the speed in the vertical direction for the sprite to move at.

## Returns

* a new projectile [sprite](/types/sprite) that moves with set velocities.

## Examples #example

### Create a projectile at the bottom left #ex1

Start a projectile sprite from the bottom left of the screen. Make it bounce on the sides of the screen.

```blocks
let projectile = sprites.createProjectileFromSide(img`
    . . . . 5 5 5 5 5 5 5 5 . . . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
    . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
    5 5 5 5 5 5 . . . . 5 5 5 5 5 5 
    5 5 5 5 5 . . . . . . 5 5 5 5 5 
    5 5 5 5 . . . . . . . . 5 5 5 5 
    5 5 5 5 . . . . . . . . 5 5 5 5 
    5 5 5 5 . . . . . . . . 5 5 5 5 
    5 5 5 5 . . . . . . . . 5 5 5 5 
    5 5 5 5 5 . . . . . . 5 5 5 5 5 
    5 5 5 5 5 5 . . . . 5 5 5 5 5 5 
    . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
    . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . 
    . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
    . . . . 5 5 5 5 5 5 5 5 . . . . 
    `, 40, -30)
projectile.setFlag(SpriteFlag.BounceOnWall, true)
```

### Create projectiles for all sides #ex2

Create projectiles that start randomly from all sides of the screen. Show the projectile direction by displaying the physics properties.

```blocks
let projectile: Sprite = null
game.onUpdateInterval(2000, function () {
    projectile = sprites.createProjectileFromSide(img`
        . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
        . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
        `, randint(-50, 50), randint(-50, 50))
    projectile.setFlag(SpriteFlag.ShowPhysics, true)
})
```

## See also #seealso

[create](/reference/sprites/create), [create projectile from sprite](/reference/sprites/create-projectile-from-sprite)
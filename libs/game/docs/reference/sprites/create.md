# create

Create a new sprite with a pixel image.

```sig
sprites.create(null)
```

Sprites provide all the operations to move and animate images. Your sprites can detect collisions and overlaps with other objects. Initially, sprites have a position in the middle of screen and have no motion. You set the location and movement of a sprite in your code. Sprites are associated with a **kind** so that they can be identifed as part of group or type, such as ``Player`` and ``Enemy``.

## Parameters

* **img**: an [image](/types/image) to create a sprite for.
* **kind**: the type of sprite to create. There are default sprite kinds already defined like ``Player``, ``Enemy``, ``Food``, etc. You can add your own kind to the currently defined `SpriteKind` (namespace) types also.

## Returns

* a game [sprite](/types/sprite) containing an image.


## Examples #example

### Smiley face #ex1

Make a sprite for a smiley face image and display it on the screen.

```blocks
let smiley: Sprite = null
smiley = sprites.create(img`
. . . . . 1 1 1 1 1 1 1 . . . . 
. . . 1 1 e e e e e e e 1 . . . 
. . 1 e e e e e e e e e e 1 . . 
. 1 e e e e e e e e e e e e 1 . 
1 e e e e 1 1 e e e 1 1 e e e 1 
1 e e e e 1 1 e e e 1 1 e e e 1 
1 e e e e e e e e e e e e e e 1 
1 e e e e e e e e e e e e e e 1 
1 e e e e e e e 1 e e e e e e 1 
1 e e e e e e e e e e e e e e 1 
1 e e e e 1 e e e e e 1 e e e 1 
1 e e e e e 1 1 1 1 1 e e e e 1 
. 1 e e e e e e e e e e e e 1 . 
. . 1 e e e e e e e e e e 1 . . 
. . . 1 1 e e e e e e e 1 . . . 
. . . . . 1 1 1 1 1 1 1 . . . . 
`, SpriteKind.Player)
```

### Drive the car #ex2

Set the scene background color and make a sprite with a car image. Set the car in motion toward the right of the screen.

```blocks
let theCar: Sprite = null
scene.setBackgroundColor(3)
theCar = sprites.create(img`
. . . . . f f f f f f f f f f f f f f f f . . . . . . . . . . . 
. . . . f d d d d d d d d d d d d d d d d f . . . . . . . . . . 
. . . f d d d d f f f f f f d d f f f f f f f . . . . . . . . . 
. . . f d d d d f . . . . f d d f . . . . . f f . . . . . . . . 
. . . f d d d d f . . . . f d d f . . . . . . f . . . . . . . . 
. . f d d d d d f f . . . f d d f . . . f f f d f f f f f . . . 
. f d d d d d d d f f f f f d d f f f f d d d d d d d d f . . . 
. f d d d f f f d d d d d d d d d d d d d d f f f d d d f . . . 
. f d d f f f f f d d d d d d d d d d d d f f f f f d d f . . . 
. f f . f f f f f . f f f f f f f f f f . f f f f f . f f . . . 
. . . . f f f f f . . . . . . . . . . . . f f f f f . . . . . . 
. . . . . f f f . . . . . . . . . . . . . . f f f . . . . . . . 

`, SpriteKind.Player)
theCar.vx = 20
game.onUpdate(function () {
    if (theCar.x > scene.screenWidth() + 16) {
        theCar.x = -16
    }
})
```

## #seealso

[create projectile](/reference/sprites/create-projectile)
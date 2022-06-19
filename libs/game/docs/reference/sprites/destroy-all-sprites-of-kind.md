# destroy All Sprites Of Kind

Destroy all the sprites of a certain kind.

```sig
sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
```

You can destroy all of the current sprites of a particular kind. For example, you could explode all of the `Enemy` sprites in your game by destroying them with a disintegrating particle effect.

## Parameters

* **kind**: the kind of the sprites you want to destroy, such as `Player` or `Enemy`.
* **effect**: a particle effect to show when a sprite is destroyed.
* **duration**: the time in milliseconds that the **effect** will show.

## Example #example

Make a game where your player must avoid contact with `Blob` sprites to stay alive. Send the blobs at random speeds from the right side of the screen. Give your player a superpower to zap all of the current blobs with one press of button `A`.

```blocks
namespace SpriteKind {
    export const Blob = SpriteKind.create()
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    sprites.destroyAllSpritesOfKind(SpriteKind.Blob, effects.disintegrate, 100)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Blob, function (sprite, otherSprite) {
    info.changeLifeBy(-1)
})
let blob: Sprite = null
info.setLife(3)
let mySprite = sprites.create(img`
    . . . . . f f f f . . . . . 
    . . . f f 5 5 5 5 f f . . . 
    . . f 5 5 5 5 5 5 5 5 f . . 
    . f 5 5 5 5 5 5 5 5 5 5 f . 
    . f 5 5 5 d b b d 5 5 5 f . 
    f 5 5 5 b 4 4 4 4 b 5 5 5 f 
    f 5 5 c c 4 4 4 4 c c 5 5 f 
    f b b f b f 4 4 f b f b b f 
    f b b 4 1 f d d f 1 4 b b f 
    . f b f d d d d d d f b f . 
    . f e f e 4 4 4 4 e f e f . 
    . e 4 f 6 9 9 9 9 6 f 4 e . 
    . 4 d c 9 9 9 9 9 9 c d 4 . 
    . 4 f b 3 b 3 b 3 b b f 4 . 
    . . f f 3 b 3 b 3 3 f f . . 
    . . . . f f b b f f . . . . 
    `, SpriteKind.Player)
controller.moveSprite(mySprite)
mySprite.left = 10
game.onUpdateInterval(500, function () {
    blob = sprites.create(img`
        . 2 2 2 . 2 2 . 
        2 2 5 2 2 2 2 2 
        2 f 2 2 5 2 2 . 
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        2 2 f 2 f 2 2 2 
        . 2 2 2 2 2 2 . 
        . 2 . 2 2 5 2 . 
        `, SpriteKind.Blob)
    blob.setFlag(SpriteFlag.AutoDestroy, true)
    blob.setPosition(scene.screenWidth(), randint(0, scene.screenHeight()))
    blob.vx = randint(-10, -50)
})
```

## See also #seealso

[start effect](/reference/sprites/sprite/start-effect),
[destroy](/reference/sprites/sprite/destroy),
[on destroyed](/reference/sprites/on-destroyed),

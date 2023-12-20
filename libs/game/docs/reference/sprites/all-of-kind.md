# all Of Kind

Get all the sprites of a certain kind.

```sig
sprites.allOfKind(SpriteKind.Player)
```

You can get an array of the current sprites of a particular kind. For example, you want to find out where of all of the `Enemy` sprites in your game are, you could get an array of them and check their location.

## Parameters

* **kind**: the kind of the sprites you want an array of, such as `Player` or `Enemy`.

## Example #example

Set a player in the center of the screen. Make a bunch of blobs appear at random positions. If there are any blobs too close to the player, have them destroyed when button `A` is pressed.

```blocks
namespace SpriteKind {
    export const Blob = SpriteKind.create()
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    for (let icky of sprites.allOfKind(SpriteKind.Blob)) {
        x2 = (icky.x - mySprite.x) ** 2
        y2 = (icky.y - mySprite.y) ** 2
        if (Math.sqrt(x2 + y2) < mySprite.width * 2) {
            sprites.destroy(icky, effects.disintegrate, 500)
        }
    }
})
let y2 = 0
let x2 = 0
let blob: Sprite = null
let mySprite: Sprite = null
mySprite = sprites.create(img`
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
for (let index = 0; index < 40; index++) {
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
    blob.setPosition(randint(0, scene.screenWidth()), randint(0, scene.screenHeight()))
}
```

## See also #seealso

[destroy all sprites of kind](/reference/sprites/sprite/destroy-all-sprites-of-kind)

# on Hit Wall

Run some code when a sprite contacts a wall.

```sig
scene.onHitWall(0, 0, function (sprite) {
	
})
```

We can detect when a moving sprite contacts a wall in the scene. You can then run some code if your sprite touches a location that is set as a wall. You choose the sprite kind to check for wall collisions.

When a wall hit is detected the sprite of the kind you asked for is given to you in the **sprite** parameter of **handler**.

A a sprite hitting a wall is dectected when the outside edges of their images make contact. If a sprite has it's ``ghost`` flag set, any contact with the wall is ignored.

## Parameters

* **kind**: the type of sprite to check for a wall hit.
* **handler**: the code to run when the sprite makes contact.
>* **sprite**: the sprite that hit the wall tile.

## Example #example

Build a brick wall of tiles in the scene. Use the **A** to send a ``Ghost`` sprite toward the wall and watch it stop.  When button **B** is pressed, switch the value of the ``ghost`` flag and see if the ghost sprite hits the wall or goes through.

```blocks
enum SpriteKind {
    Ghost,
    Ball
}
let ghost: Sprite = null
scene.setTile(2, img`
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 f 2 1 
1 2 2 f 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 f 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 f 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 f 2 2 2 f 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 f 2 2 2 2 2 2 2 2 f 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
1 2 2 2 2 2 2 f 2 2 2 2 f 2 2 1 
1 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 
`, true)
// TODO tiles.setTilemap(tiles.createTilemap(null, 0, 8 ** 8, 9)); 
ghost = sprites.create(img`
. . . . . . d d d d d . . . . . 
. . . d d d d 1 1 1 d d d . . . 
. . d d 1 1 1 1 1 1 1 1 d d . . 
. . d 1 1 1 1 1 1 1 1 1 1 d . . 
. . d 1 1 1 1 1 1 1 1 1 1 d d . 
. d d 1 1 1 f 1 1 1 f 1 1 1 d . 
. d 1 1 1 1 1 1 1 1 1 1 1 1 d d 
. d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
. d 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
d d 1 1 1 1 1 1 f f 1 1 1 1 1 d 
d 1 1 1 1 1 1 1 f f 1 1 1 1 1 d 
d 1 1 1 1 1 1 1 1 1 1 1 1 1 1 d 
d 1 1 1 1 1 1 1 d 1 1 1 1 1 1 d 
d 1 d d d 1 1 d d d d 1 d 1 1 d 
d d d . d d d d . . d d d d d d 
d d . . . d d . . . . d . . d d 
`, SpriteKind.Ghost)
ghost.right = scene.screenWidth() - 1
scene.onHitTile(SpriteKind.Ghost, 2, function (sprite) {
    sprite.say("Ouch!", 200)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    ghost.setFlag(SpriteFlag.Ghost, false)
    ghost.right = scene.screenWidth() - 1
    ghost.vx = - 100
}) 
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    ghost.setFlag(SpriteFlag.Ghost, true)
    ghost.right = scene.screenWidth() - 1
    ghost.vx = - 100
})
```

## See also #seealso

[is hitting wall](/reference/sprites/sprite/is-hitting-wall),
[tile hit of kind](/reference/sprites/sprite/tile-hit-of-kind),
[overlaps with](/reference/sprites/sprite/overlaps-with),
[set flag](/reference/sprites/sprite/set-flag)

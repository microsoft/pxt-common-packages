# on Overlap

Run some code when a sprite of a certain kind overlaps another sprite. 

```sig
sprites.onOverlap(0, 0, function (sprite, otherSprite) {
	
})
```

An overlap with a sprite of a different or the same kind is detected. If you want to know when a ``Player`` sprite overlaps an ``Enemy`` sprite, you set the first sprite kind to ``Player`` and the second sprite kind in **otherKind** to ``Enemy``. You can detect overlap with two player sprites, for example, by setting both **kind** and **otherKind** to ``Player``.

When an overlap is detected the sprite of the first kind is given to you in the **sprite** parameter of **handler**. The sprite for the second kind is in **otherSprite**.

An overlap of two sprites is dectected when the first non-transparent pixel in the image of the first sprite overlaps the first non-transparent pixel of the second sprite. If a sprite has it's ``ghost`` flag set, any overlap with another sprite won't be noticed. Also, an overlap occurs even when the values of **Z** for the sprites are different.

## Parameters

* **kind**: the first type of sprite to check for overlap.
* **otherKind**: the second type of sprite to check for overlap.
* **handler**: the code to run when the sprites overlap.
>* **sprite**: the first overlapping sprite.
>* **otherSprite**: the second overlapping sprite.

## Example #example

### Ghost bumper #ex1

Create a ``Ghost`` sprite that is blasted by green balls. Let the balls go through the sprite until it's ``kind`` is changed to ``Mortal`` by pressing the **A** button. When the ``Ghost`` sprite is changed to ``Mortal``, any contact with the balls is detected in ``||sprites:on overlaps||``. Make the balls push the ``Mortal`` sprite off the screen.

```blocks
enum SpriteKind {
    Mortal,
    Ghost,
    Ball
}
let ghost: Sprite = null
let projectile: Sprite = null
let sprite: Sprite = null
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
ghost.x = 40
ghost.setFlag(SpriteFlag.AutoDestroy, true)
game.onUpdateInterval(400, function () {
    projectile = sprites.createProjectile(img`
. . 7 7 7 7 . . 
. 7 7 7 7 7 7 . 
7 7 7 7 7 7 7 7 
7 7 7 7 7 7 7 7 
7 7 7 7 7 7 7 7 
7 7 7 7 7 7 7 7 
. 7 7 7 7 7 7 . 
. . 7 7 7 7 . . 
`, -400, 0, SpriteKind.Ball)
    projectile.z = -1
})
sprites.onOverlap(SpriteKind.Mortal, SpriteKind.Ball, function (sprite, otherSprite) {
    sprite.say("Ouch!", 200)
    otherSprite.vx = otherSprite.vx * -1
    otherSprite.vy = Math.randomRange(-100, 100)
    sprite.x += -1
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    ghost.type = SpriteKind.Mortal
})
sprites.onDestroyed(SpriteKind.Mortal, function (sprite) {
    game.over()
})
```

## Ghosting mode #ex2

Use the **A** to blast a green ball at a ``Ghost`` sprite. Set the flag for the sprite to ``Ghost``. In the ``||sprites:on overlaps||`` block, try to detect the contact of the ball with the ghost. When button **B** is pressed, switch the value of the ``ghost`` flag and see if the ball hits the ghost sprite.

```blocks
enum SpriteKind {
    Ghost,
    Ball
}
let ghosting = true
let ghost: Sprite = null
let projectile: Sprite = null
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
ghost.x = 40
ghost.setFlag(SpriteFlag.Ghost, true)
sprites.onOverlap(SpriteKind.Ghost, SpriteKind.Ball, function (sprite, otherSprite) {
    sprite.say("Ouch!", 200)
    otherSprite.vx = otherSprite.vx * -1
    otherSprite.vy = Math.randomRange(-100, 100)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    projectile = sprites.createProjectile(img`
. . 7 7 7 7 . . 
. 7 7 7 7 7 7 . 
7 7 7 7 7 7 7 7 
7 7 7 7 7 7 7 7 
7 7 7 7 7 7 7 7 
7 7 7 7 7 7 7 7 
. 7 7 7 7 7 7 . 
. . 7 7 7 7 . . 
`, -400, 0, SpriteKind.Ball)
    projectile.z = -1
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    ghosting = !(ghosting)
    ghost.setFlag(SpriteFlag.Ghost, ghosting)
})
```

## See also #seealso

[overlaps with](/reference/sprites/sprite/overlaps-with),
[set flag](/reference/sprites/sprite/set-flag)

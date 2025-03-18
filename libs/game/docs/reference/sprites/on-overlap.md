# on Overlap

Run some code when a sprite of a certain kind overlaps another sprite. 

```sig
sprites.onOverlap(0, 0, function (sprite, otherSprite) {
	
})
```

An overlap with a sprite of a different or the same kind is detected. If you want to know when a ``Player`` sprite overlaps an ``Enemy`` sprite, you set the first sprite kind to ``Player`` and the second sprite kind in **otherKind** to ``Enemy``. You can detect overlap with two player sprites, for example, by setting both **kind** and **otherKind** to ``Player``.

When an overlap is detected the sprite of the first kind is given to you in the **sprite** parameter of **handler**. The sprite for the second kind is in **otherSprite**.

An overlap of two sprites is detected when the first non-transparent pixel in the image of the first sprite overlaps the first non-transparent pixel of the second sprite. If a sprite has it's ``ghost`` flag set, any overlap with another sprite won't be noticed. Also, an overlap occurs even when the values of **Z** for the sprites are different.

## Parameters

* **kind**: the first type of sprite to check for overlap.
* **otherKind**: the second type of sprite to check for overlap.
* **handler**: the code to run when the sprites overlap.
>* **sprite**: the first overlapping sprite.
>* **otherSprite**: the second overlapping sprite.

## Example #example

Create a ``Ghost`` sprite that is blasted by yellow balls. Let the balls go through the sprite until it's ghost status is removed by pressing the **A** button. When the ``Ghost`` sprite is exposed, any contact with the balls is detected in ``||sprites:on overlap||``. Make the balls push the ``Ghost`` sprite off the screen.

```blocks
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    ghost.setFlag(SpriteFlag.Ghost, false)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (sprite, otherSprite) {
    otherSprite.setVelocity(-50, 50)
    sprite.sayText("Ouch!", 200, false)
    sprite.setPosition(sprite.x + 2, sprite.y + 2)
})
sprites.onDestroyed(SpriteKind.Player, function (sprite) {
    game.gameOver(false)
})
let projectile: Sprite = null
let ghost: Sprite = null
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
    `, SpriteKind.Player)
ghost.setPosition(60, 60)
ghost.setFlag(SpriteFlag.AutoDestroy, true)
ghost.setFlag(SpriteFlag.Ghost, true)
game.onUpdateInterval(1000, function () {
    projectile = sprites.createProjectileFromSide(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . 5 5 . . . . . . . 
        . . . . . . 5 5 5 5 . . . . . . 
        . . . . . 5 5 5 5 5 5 . . . . . 
        . . . . . 5 5 5 5 5 5 . . . . . 
        . . . . . . 5 5 5 5 . . . . . . 
        . . . . . . . 5 5 . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, 50, 50)
})
```

## See also #seealso

[overlaps with](/reference/sprites/sprite/overlaps-with),
[set flag](/reference/sprites/sprite/set-flag)

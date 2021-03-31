# run Movement Animation

Apply a movement animation effect to a sprite.

```sig
animation.runMovementAnimation(null, "")
```

A movement animation is motion effect applied to a sprite. The image in the
sprite will appear to move with the type of motion that you select. You have several
movement types to choose from and you can select them from the list in the block.

The animation runs for the amount of time you set for it. When the animation finishes, the sprite returns to its original position. You can make the animation repeat by setting the **loop** parameter to **ON**.

## Parameters

* **sprite**: a sprite to attach the animation to.
* **pathString**: an name of a movement path to apply to a sprite.
* **duration**: the [number](/types/number) of milleseconds to run the animation for.
* **loop**: a [boolean](/types/boolean) value that if ``true`` will cause the sprite to return to its original position and restart the animation. If ``false``, the animation runs only once and the sprite remains at the last location of the animation.

## Example #example

Create a large taco sprite. Run a movement animation on the taco to make it "bob"
to the right of the screen for `5` seconds.

```blocks
scene.setBackgroundColor(1)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . e e e e e e e . . . . . . . . . . .
    . . . . . . . . . . . . e e 4 5 5 6 6 2 e 2 e . . . . . . . . .
    . . . . . . . . . . e e 4 5 5 5 6 7 2 3 e 2 6 8 8 . . . . . . .
    . . . . . . . . . e 4 6 7 7 6 6 7 7 2 3 2 e 7 7 7 6 6 8 . . . .
    . . . . . . . . e 4 6 7 4 5 5 5 4 7 7 2 2 2 7 7 7 6 7 7 8 . . .
    . . . . . . . 4 4 4 8 7 4 4 4 4 4 7 7 7 7 6 6 7 7 7 6 7 8 . . .
    . . . . . . 4 5 2 2 e 7 7 7 7 7 7 6 7 7 7 7 6 6 6 7 6 6 6 8 . .
    . . . . . 4 5 2 3 2 2 7 7 6 6 7 2 2 e 6 6 6 e e e e e 8 8 8 . .
    . . . . 4 5 5 2 3 2 e 7 6 6 7 2 3 2 2 e 4 5 5 5 d d d d 4 8 . .
    . . . 4 4 5 6 7 7 7 7 5 5 4 6 2 3 e 4 5 5 d d d d d d d d d 4 .
    . . . e 6 6 7 7 4 5 5 4 4 7 7 e 4 5 5 d d d d 5 5 5 5 4 d d 4 4
    . . e 4 6 7 7 7 4 4 4 6 7 7 e 5 5 d d 5 5 5 5 5 d 5 5 d d d d 4
    . . e 5 6 6 8 6 7 7 6 6 6 e 5 d d 5 5 5 5 5 5 5 5 5 5 5 5 d d e
    . e 4 5 5 4 4 e 8 7 7 6 e 5 d 5 5 5 5 5 4 5 5 5 5 5 5 5 5 5 d e
    . e 5 5 4 e e e e 6 6 e 5 d 5 5 5 5 d 5 5 5 5 5 d d d d 5 4 d e
    . e 5 5 e e 4 4 f e e 5 d 5 d 5 5 5 5 5 5 d 5 d 5 d d d d d d e
    e 4 5 4 e e e e f e 4 5 d 5 5 5 5 5 5 5 5 5 5 5 d d 4 d d d e .
    e 5 e 4 e e f f f e 5 d 5 5 5 5 5 5 5 5 d 5 5 5 5 d d d d e . .
    e 5 e e 4 e e f f 4 5 d 5 5 5 5 5 5 5 5 5 5 5 5 d d d d e . . .
    e 5 e e e e f f e 5 d 5 5 d 5 5 5 d 5 5 5 5 d 5 d d d e . . . .
    e 5 f f e f e e e 5 d 5 5 5 4 5 5 5 5 5 5 5 d d d 4 e . . . . .
    e 5 f f f f f f e 5 4 5 5 5 5 5 5 5 d 5 d 4 d d e e . . . . . .
    e 5 4 e f e f f 4 5 d 5 5 d 5 5 5 5 5 d d d d e . . . . . . . .
    e 5 e e e f f e 5 d d 5 5 5 5 5 4 5 d d d e e . . . . . . . . .
    e 4 e e e f f f 5 d 5 5 5 5 d 5 5 d d d e . . . . . . . . . . .
    e 4 e f e f f f 5 d 5 d 5 5 5 5 5 d 4 e . . . . . . . . . . . .
    . e 4 e f f f e 5 d 5 5 5 5 5 5 d e e . . . . . . . . . . . . .
    . e 5 4 e e e e 5 d 5 4 5 d d 4 e . . . . . . . . . . . . . . .
    . . e 5 5 4 e e 5 d d d d d e e . . . . . . . . . . . . . . . .
    . . . e e 5 5 4 4 d d d e e . . . . . . . . . . . . . . . . . .
    . . . . . e e e e e e e . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
`, SpriteKind.Player)
animation.runMovementAnimation(
mySprite,
animation.animationPresets(animation.bobbingRight),
5000,
true
)
```

## See Also #seealso

[run image animation](/reference/animation/run-image-animation),
[stop animation](/reference/animation/stop-animation)

```package
animation
```

# stop Animation

Stop an animation from running on a sprite.

```sig
animation.stopAnimation(0, null)
```

You can run an image or movement animation on a sprite. A sprite can even have both types running at the same time. The one type of animation, or all types, can be stopped. You might want to stop an animation if it's looped or runs for a long time.

## Parameters

* **type**: the type of animation to stop: ``all``, ``frame``, or ``path``.
* **sprite**: the [sprite](types/strite) to stop running the animation on.

## Example #example

Create and run an animation of a person walking. Loop the animation and then
stop it by pressing button **A**.

```blocks
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    animation.stopAnimation(animation.AnimationTypes.All, mySprite)
})
scene.setBackgroundColor(1)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`, SpriteKind.Player)
animation.runImageAnimation(
mySprite,
[img`
    . . . . f f f f . . . . .
    . . f f f f f f f f . . .
    . f f f f f f c f f f . .
    f f f f f f c c f f f c .
    f f f c f f f f f f f c .
    c c c f f f e e f f c c .
    f f f f f e e f f c c f .
    f f f b f e e f b f f f .
    . f 4 1 f 4 4 f 1 4 f . .
    . f e 4 4 4 4 4 4 e f . .
    . f f f e e e e f f f . .
    f e f b 7 7 7 7 b f e f .
    e 4 f 7 7 7 7 7 7 f 4 e .
    e e f 6 6 6 6 6 6 f e e .
    . . . f f f f f f . . . .
    . . . f f . . f f . . . .
`, img`
    . . . . . . . . . . . . .
    . . . . f f f f . . . . .
    . . f f f f f f f f . . .
    . f f f c f f f f f f . .
    c f f f c c f f f f f f f
    c f f f f f f f c f f f f
    c c f f e e f f f c c c .
    f c c f f e e f f f f f .
    f f f b f e e f b f f f .
    f f 4 1 f 4 4 f 1 4 f f .
    e f e e 4 4 4 4 4 e f . .
    e 4 4 4 e 7 7 7 b f e f .
    . e 4 4 e 7 7 7 7 f 4 e .
    . . e e 6 6 6 6 6 f . . .
    . . . f f f f f f f . . .
    . . . . . . . f f f . . .
`, img`
    . . . . . . . . . . . . .
    . . . . . f f f f . . . .
    . . . f f f f f f f f . .
    . . f f f f f f c f f f .
    f f f f f f f c c f f f c
    f f f f c f f f f f f f c
    . c c c f f f e e f f c c
    . f f f f f e e f f c c f
    . f f f b f e e f b f f f
    . f f 4 1 f 4 4 f 1 4 f f
    . . f e 4 4 4 4 4 e e f e
    . f e f b 7 7 7 e 4 4 4 e
    . e 4 f 7 7 7 7 e 4 4 e .
    . . . f 6 6 6 6 6 e e . .
    . . . f f f f f f f . . .
    . . . f f f . . . . . . .
`],
500,
true
)```

## See Also #seealso

[run image animation](/reference/animation/run-image-animation),
[run movement animation](/reference/animation/run-movement-animation)

```package
animation
```
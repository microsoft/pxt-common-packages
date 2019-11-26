# run Image Animation

Run an animation of frames from an array of images in a sprite.

```sig
animation.runImageAnimation(null, null)
```

An animation creates an effect of an object moving within the area of a _frame_.
A single frame is a still image of an object at some point in time during its movement.
Showing different frames with a brief pause between them will create the effect of movement of an object.

## Sprite animations

Animations are shown in a [sprite](/types/sprite). So, wherever the sprite is placed,
the animation will run there. You create your animation by setting two or more images into the **frames** array assigned to the sprite. You can set the amount of time between frames to make the animation run fast or slow. If you want the animation to repeat itself continously, you can make it _loop_.

### ~ hint

#### Frame and image sizes

The size of the frame is adjusted to show the contents of every frame. If some of the images in the frames array don't match each other, the frame size of the animation
is expanded so that it can show each one.

It's best to make all of the images in your frames array be the same size so that
your object's position changes and movement will look correct.

### ~

## Parameters

* **sprite**: the sprite that the animation will run in.
* **frames**: an array of images that create the animation.
* **frameInterval**: the [number](/types/number) of milliseconds to wait before the next frame is shown.
* **loop**: a [boolean](/types/boolean) value that if ``true`` will cause the animation to repeat. If ``false``, the animation runs only once.

## Example #example

### Walker animation

Create and run an animation of a person walking. Set the animation frames as an array
of images with a person at different positions of movement.

```blocks
scene.setBackgroundColor(13)
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
    . . . . f f f f . . . .
    . . f f e e e e f f . .
    . f f e e e e e e f f .
    f f f f 4 e e e f f f f
    f f f 4 4 4 e e f f f f
    f f f 4 4 4 4 e e f f f
    f 4 e 4 4 4 4 4 4 e 4 f
    f 4 4 f f 4 4 f f 4 4 f
    f e 4 d d d d d d 4 e f
    . f e d d b b d d e f .
    . f f e 4 4 4 4 e f f .
    e 4 f b 1 1 1 1 b f 4 e
    4 d f 1 1 1 1 1 1 f d 4
    4 4 f 6 6 6 6 6 6 f 4 4
    . . . f f f f f f . . .
    . . . f f . . f f . . .
`, img`
    . . . . . . . . . . . .
    . . . f f f f f f . . .
    . f f f e e e e f f f .
    f f f e e e e e e f f f
    f f f f 4 e e e f f f f
    f f f 4 4 4 e e f f f f
    f f f 4 4 4 4 e e f f f
    f 4 e 4 4 4 4 4 4 e 4 f
    f 4 4 f f 4 4 f f 4 4 f
    f e 4 d d d d d d 4 e f
    . f e d d b b d 4 e f e
    f f f e 4 4 4 4 d d 4 e
    e 4 f b 1 1 1 e d d e .
    . . f 6 6 6 6 f e e . .
    . . f f f f f f f . . .
    . . f f f . . . . . . .
`, img`
    . . . . . . . . . . . .
    . . . f f f f f f . . .
    . f f f e e e e f f f .
    f f f e e e e e e f f f
    f f f f 4 e e e f f f f
    f f f 4 4 4 e e f f f f
    f f f 4 4 4 4 e e f f f
    f 4 e 4 4 4 4 4 4 e 4 f
    f 4 4 f f 4 4 f f 4 4 f
    f e 4 d d d d d d 4 e f
    e f e 4 d b b d d e f .
    e 4 d d 4 4 4 4 e f f f
    . e d d e 1 1 1 b f 4 e
    . . e e f 6 6 6 6 f . .
    . . . f f f f f f f . .
    . . . . . . . f f f . .
`, img`
    . . . f f f f f . . . .
    . . f e e e e e f f . .
    . f e e e e e e e f f .
    f e e e e e e e f f f f
    f e e 4 e e e f f f f f
    f e e 4 4 e e e f f f f
    f f e 4 4 4 4 4 f f f f
    f f e 4 4 f f 4 e 4 f f
    . f f d d d d 4 d 4 f .
    . . f b b d d 4 f f f .
    . . f e 4 4 4 e e f . .
    . . f 1 1 1 e d d 4 . .
    . . f 1 1 1 e d d e . .
    . . f 6 6 6 f e e f . .
    . . . f f f f f f . . .
    . . . . . f f f . . . .
`],
500,
true
)
```

### Trampoline

Run a movement animation on a sprite that also an image animation. Create an
effect of a person jumping on a trampoline.

```blocks
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
`],
500,
true
)
animation.runMovementAnimation(
mySprite,
animation.animationPresets(animation.bobbing),
1000,
true
)
```

## See Also #seealso

[run movement animation](/reference/animation/run-movement-animation),
[stop animation](/reference/animation/stop-animation)

```package
animation
```
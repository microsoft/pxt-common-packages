# Animation

## Sprite animations

Create and run animations on sprites. You can create image frame animations or
use animated movements on an existing sprite.

```cards
animation.runImageAnimation(null, null)
animation.runMovementAnimation(null, "")
animation.stopAnimation(0, null)
```

## Advanced animations

These blocks are available to support programs using advanced animation methods.
They can be found by adding the `animation` extension to your project.

```cards
animation.createAnimation(0, 0)
animation.createAnimation(0, 0).addAnimationFrame(null)
animation.attachAnimation(null, null)
animation.setAction(null, 0)
```

## See also #seealso

[run image animation](/reference/animation/run-image-animation),
[run movement animation](/reference/animation/run-movement-animation),
[stop animation](/reference/animation/stop-animation),
[create animations](/reference/animation/create-animations),
[add animation frame](/reference/animation/add-animation-frame),
[attach animation](/reference/animation/attach-animation),
[set action](/reference/animation/set-action)

```package
animation
```
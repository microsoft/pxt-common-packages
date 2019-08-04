let mySprite: Sprite = null
animation.runImageAnimation(
    [img`
    . . . . . . . . . . . . . . . .
    . . . . . . f f f f . . . . . .
    . . . . f f f 2 2 f f f . . . .
    . . . f f f 2 2 2 2 f f f . . .
    . . f f f e e e e e e f f f . .
    . . f e e 2 2 2 2 2 2 e f f . .
    . f f e 2 f f f f f f 2 e f f .
    . f f f f f e e e e f f f f f .
    . . f e f b f 4 4 f b f e f . .
    . . f e 4 1 f d d f 1 4 e f f .
    . . e f e 4 d d d d 4 e f f d f
    . . e 4 d d e 2 2 2 2 f e f b f
    . . . e d d e 2 2 2 2 f 4 f b f
    . . . . e e f 5 5 4 4 f . f c f
    . . . . . f f f f f f f . f f .
    . . . . . . . . . f f f . . . .
    `],
    mySprite,
    500
)
animation.runMovementAnimation(
    mySprite,
    animation.animationPresets(animation.flyToCenter),
    500
)
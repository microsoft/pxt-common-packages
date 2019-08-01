let mySprite: Sprite = null
animation.runImageAnimation(
    [],
    mySprite,
    500,
    true
)
animation.runMovementAnimation(
    mySprite,
    animation.animationPresets(animation.flyToCenter),
    500,
    false
)
animation.animationPresets(animation.shake)
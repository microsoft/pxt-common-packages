
storyboard.registerScene("lemon", function () {
    let mySprite = sprites.create(img`
        4 4 4 . . 4 4 4 4 4 . . . . . .
        4 5 5 4 4 5 5 5 5 5 4 4 . . . .
        b 4 5 5 1 5 1 1 1 5 5 5 4 . . .
        . b 5 5 5 5 1 1 5 5 1 1 5 4 . .
        . b d 5 5 5 5 5 5 5 5 1 1 5 4 .
        b 4 5 5 5 5 5 5 5 5 5 5 1 5 4 .
        c d 5 5 5 5 5 5 5 5 5 5 5 5 5 4
        c d 4 5 5 5 5 5 5 5 5 5 5 1 5 4
        c 4 5 5 5 d 5 5 5 5 5 5 5 5 5 4
        c 4 d 5 4 5 d 5 5 5 5 5 5 5 5 4
        . c 4 5 5 5 5 d d d 5 5 5 5 5 b
        . c 4 d 5 4 5 d 4 4 d 5 5 5 4 c
        . . c 4 4 d 4 4 4 4 4 d d 5 d c
        . . . c 4 4 4 4 4 4 4 4 5 5 5 4
        . . . . c c b 4 4 4 b b 4 5 4 4
        . . . . . . c c c c c c b b 4 .
    `, SpriteKind.Player)
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        storyboard.transitionToScene("burger")
    })
})
storyboard.registerScene("burger", function () {
    let mySprite = sprites.create(img`
        . . . . c c c b b b b b . . . .
        . . c c b 4 4 4 4 4 4 b b b . .
        . c c 4 4 4 4 4 5 4 4 4 4 b c .
        . e 4 4 4 4 4 4 4 4 4 5 4 4 e .
        e b 4 5 4 4 5 4 4 4 4 4 4 4 b c
        e b 4 4 4 4 4 4 4 4 4 4 5 4 4 e
        e b b 4 4 4 4 4 4 4 4 4 4 4 b e
        . e b 4 4 4 4 4 5 4 4 4 4 b e .
        8 7 e e b 4 4 4 4 4 4 b e e 6 8
        8 7 2 e e e e e e e e e e 2 7 8
        e 6 6 2 2 2 2 2 2 2 2 2 2 6 c e
        e c 6 7 6 6 7 7 7 6 6 7 6 c c e
        e b e 8 8 c c 8 8 c c c 8 e b e
        e e b e c c e e e e e c e b e e
        . e e b b 4 4 4 4 4 4 4 4 e e .
        . . . c c c c c e e e e e . . .
    `, SpriteKind.Player)
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        storyboard.transitionToScene("lemon")
    })
})
storyboard.transitionToScene("lemon")


let mySprite = sprites.create(img`
0 1 2 3
4 5 6 7
8 9 a b
c d e f
`.doubled().doubled().doubled().doubled(), SpriteKind.Player)

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    const p = palette.defaultPalette();
    for (let i = 0; i < p.length; ++i) {
        p.setColor(i, color.rgb(i * 16, 0, 255 - i * 16));
    }
    p.setColor(0, 0)
    palette.setColors(p)
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    palette.reset()
})


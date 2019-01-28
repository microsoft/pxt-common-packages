# screen Image

Get an image of everything displayed on the screen.

```sig
image.screenImage()
```

## Returns

* an [image](/types/image) of everything displayed on the screen.

## Example #example

Place a cake sprite on the screen with a background color. When the **A** button is pressed, get the screen image and then destroy the cake sprite. Flip the image upside down and set it to the background.

```blocks
enum SpriteKind {
    Player,
    Projectile,
    Food,
    Enemy
}
let mySprite: Sprite = null
let screenCap: Image = null
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    screenCap = image.screenImage()
    screenCap.flipY()
    mySprite.destroy()
    pause(100)
    scene.setBackgroundImage(image.screenImage())
})
mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . . . . . . . b b b . . . . . . .
    . . . . . . . . . . . . . . . . . . . . b b 3 3 3 b . . . . . .
    . . . . . . . . . . . . . . . . . b b b 3 3 3 d 3 3 b . . . . .
    . . . . . . . . . . . . . . . . b b 3 3 3 3 3 3 d 3 a . . . . .
    . . . . . . . . . . . . . . b b 3 3 3 3 2 e e e e d b a . . . .
    . . . . . . . . . . . . b b b 3 3 3 3 2 3 e e e 2 e 3 a . . . .
    . . . . . . . . . . b b d 3 3 3 3 3 3 e 2 2 2 2 2 e d 3 a . . .
    . . . . . . . b b b d d 3 3 3 3 3 3 3 e 2 2 2 2 2 e d d a . . .
    . . . . . . b b 3 d 3 3 3 3 3 3 3 3 3 b e 2 2 2 e b 3 d 3 a . .
    . . . b b b 3 d d 3 3 3 3 3 3 3 3 3 3 3 b e e e b 3 3 d 3 a . .
    . . b 3 d d d 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 d d a . .
    b b d d d 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 d d 3 a .
    b 3 3 d d d d d d 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 d 3 a .
    b b 3 3 3 3 3 3 3 d d d d d 3 3 3 3 3 3 3 3 3 3 3 3 3 3 d d a .
    b b b b b b b 3 3 3 d d 3 3 d d d d d d d d d d 3 3 3 3 d d b a
    b 5 5 5 5 3 b b b b b b 3 3 3 3 d d 3 3 3 3 3 d d d 3 3 d d 3 a
    b 5 5 5 5 5 5 5 5 5 5 5 3 b b b b b b b b 3 3 3 3 3 d d d d 3 a
    b d 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 d d d b a a a a a b 3 d 3 b a
    b b 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 d d d d d d d b b 3 3 b a
    b 3 b b 3 5 5 5 5 5 5 5 5 5 5 d 5 5 5 5 d 5 5 d d d d d b b b a
    b 3 3 3 3 3 b b b 3 5 5 d d 5 5 5 5 5 d 5 5 5 d d d d d d b b a
    b 5 5 5 5 d 3 3 3 3 3 3 b b b 3 5 d d d d d d 5 5 d d d d b b a
    b 5 d 5 5 5 d d 5 5 5 3 3 3 3 b b b b b 3 d d d d d d d d b 3 a
    b 5 d 5 5 5 5 5 5 5 5 5 5 5 5 d d 3 3 3 3 b b b b b b 3 d b 3 a
    b d 5 d 5 5 5 5 5 5 d 5 5 5 5 5 d d 5 5 5 d d b b b b b b b 3 a
    b b b 5 5 d d 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 d d d d d d b b 3 a
    . . . b b b b d d 5 5 5 d d d 5 5 5 5 d d d d d d d d d d b 3 a
    . . . . . . . b b b b 5 5 5 5 5 5 d 5 d d d 5 d d d d d d b 3 a
    . . . . . . . . . . . b b b b 5 5 5 5 5 5 5 5 5 5 5 d d 5 3 3 a
    . . . . . . . . . . . . . . . b b b b d d d 5 d 5 5 d 5 b 3 b a
    . . . . . . . . . . . . . . . . . . . b b b b d d d d b 3 b a .
    . . . . . . . . . . . . . . . . . . . . . . . b b b a a a a . .
`, SpriteKind.Player)
```

## See also

[set background image](/reference/scene/set-background-image)
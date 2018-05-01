# is Pressed

Check if a key is being pressed or not.

```sig
keys.any.isPressed()
```

## Returns

* a [boolean](types/boolean): `true` if the key is pressed, `false` if the key is not pressed.

## Example #example

Ramdomly move a yellow box around the screen while the ``A`` key is pressed.

```blocks
let yellowBox = sprites.create(img`
e e e e e e
e 1 1 1 1 e
e 1 6 6 1 e
e 1 6 6 1 e
e 1 1 1 1 e
e e e e e e
`)
game.onFrameUpdate(function () {
    if (keys.A.isPressed()) {
        yellowBox.x = Math.randomRange(3, scene.screenWidth() - 3)
        yellowBox.y = Math.randomRange(3, scene.screenHeight() - 3)
    }
})
```

## See also #seealso

[was pressed](/reference/keys/key/was-pressed),
[on event](/reference/keys/key/on-event)

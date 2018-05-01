# was Pressed

Check if a key was pressed earlier.

```sig
keys.any.wasPressed()
```

The fact that a key was pressed earlier is remembered. Once **was pressed** is used, this fact is forgotten and the result is `false` the next time you check with **was pressed** key _state_ is reset). But, if you press the key again before you check with **was pressed**, it will tell you `true`. 

## Returns

* a [boolean](types/boolean): `true` if the key was pressed before, `false` if the key was not pressed before

## Example #example

Move a yellow box to the right each time the ``right`` key was pressed.

```blocks
let yellowBox = sprites.create(img`
e e e e e e
e 1 1 1 1 e
e 1 6 6 1 e
e 1 6 6 1 e
e 1 1 1 1 e
e e e e e e
`)
yellowBox.x = 3
yellowBox.y = scene.screenHeight() / 2
game.onFrameUpdate(function () {
    if (keys.right.wasPressed()) {
        yellowBox.x += 6
    }
})
```

## See also #seealso

[is pressed](/reference/keys/key/is-pressed),
[on event](/reference/keys/key/on-event)

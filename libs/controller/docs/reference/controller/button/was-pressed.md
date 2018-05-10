# was Pressed

Check if a button was pressed earlier.

```sig
controller.anyButton.wasPressed()
```

The fact that a button was pressed earlier is remembered. Once **was pressed** is used, this fact is forgotten and the result is `false` the next time you check with **was pressed** button _state_ is reset). But, if you press the button again before you check with **was pressed**, it will tell you `true`. 

## Returns

* a [boolean](types/boolean): `true` if the button was pressed before, `false` if the button was not pressed before

## Example #example

Move a yellow box to the right each time the ``right`` button was pressed.

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
game.onUpdate(function () {
    if (controller.right.wasPressed()) {
        yellowBox.x += 6
    }
})
```

## See also #seealso

[is pressed](/reference/controller/button/is-pressed),
[on event](/reference/controller/button/on-event)

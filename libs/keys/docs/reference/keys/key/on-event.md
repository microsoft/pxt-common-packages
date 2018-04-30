# on Event

Run some code when a key is pressed or released.

```sig
keys.any.onEvent(KeyEvent.Pressed, function () {

});
```

## Parameters

* **event**: the key action to wait for. The key actions (events) are:
> * ``pressed``: key was pressed
> * ``released``: button is released from being pressed
* **handler**: the code you want to run when something happens to a key

## Example #example

Move a yellow box to a random location on the screen when a key is pressed.

```blocks
let yellowBox = sprites.create(img`
e e e e e e
e 1 1 1 1 e
e 1 6 6 1 e
e 1 6 6 1 e
e 1 1 1 1 e
e e e e e e
`)
keys.any.onEvent(KeyEvent.Pressed, function () {
    yellowBox.x = Math.randomRange(3, scene.screenWidth() - 3)
    yellowBox.y = Math.randomRange(3, scene.screenHeight() - 3)
})
```

## See also #seealso

[is pressed](/reference/keys/key/is-pressed),
[was pressed](/reference/keys/key/was-pressed)

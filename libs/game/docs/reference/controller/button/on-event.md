# on Event

Run some code when a button is pressed or released.

```sig
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {

});
```

## Parameters

* **event**: the button action to wait for. The button actions (events) are:
> * ``pressed``: button was pressed
> * ``released``: button is released from being pressed
> * ``repeated``: this event keeps repeating when the button is pressed
* **handler**: the code you want to run when something happens to a button

## Example #example

Move a yellow box to a random location on the screen when a button is pressed.

```blocks
let yellowBox = sprites.create(img`
e e e e e e
e 1 1 1 1 e
e 1 6 6 1 e
e 1 6 6 1 e
e 1 1 1 1 e
e e e e e e
`)
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    yellowBox.x = Math.randomRange(3, scene.screenWidth() - 3)
    yellowBox.y = Math.randomRange(3, scene.screenHeight() - 3)
})
```

## See also #seealso

[is pressed](/reference/controller/button/is-pressed)

# set Repeat Default

Set the time for repeating button events for all controller buttons.

```sig
controller.setRepeatDefault(0, 0)
```

When your using a repeated controller button event, you may want to decide when and how often your game is notified of a button press when a controller button is held down for a long time. You can set the time between when a button is first pressed and when your program is told that the button is pressed. This lets you decide that a button press of a certain amount of time is valid for your game. Also, if the player keeps the button pressed, your game probably only wants to know about it every so often to make updates. So, you can set the amount of time between the events that tell your program that a button is still pressed.

## Parameters

* **delay**: the [number](/types/number) of milliseconds to wait between when a button is pressed and when the program receives the button event.
* **interval**: the [number](/types/number) of milliseconds between multiple button events when a button remains pressed.

## Example #example

Create a sprite with a circular image.  Set the button event repeat time to `200` milliseconds when a controller button is held down. Move the sprite down and to the right when button **A** is pressed. When button **B** is pressed, send the sprite in the other direction but faster.

```blocks
controller.A.onEvent(ControllerButtonEvent.Repeated, function () {
    mySprite.top += 1
    mySprite.left += 1
})
controller.B.onEvent(ControllerButtonEvent.Repeated, function () {
    mySprite.top += -4
    mySprite.left += -4
})
let mySprite: Sprite = null
mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . 7 7 7 7 7 7 . . . . .
    . . . 7 7 7 7 7 7 7 7 7 7 . . .
    . . . 7 7 7 7 7 7 7 7 7 7 . . .
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . .
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . .
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . .
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . .
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . .
    . . 7 7 7 7 7 7 7 7 7 7 7 7 . .
    . . . 7 7 7 7 7 7 7 7 7 7 . . .
    . . . 7 7 7 7 7 7 7 7 7 7 . . .
    . . . . . 7 7 7 7 7 7 . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`, SpriteKind.Player)
mySprite.top = 0
mySprite.left = 0
controller.setRepeatDefault(500, 200)
```

## See also #seealso

[on event](/reference/controller/on-event)

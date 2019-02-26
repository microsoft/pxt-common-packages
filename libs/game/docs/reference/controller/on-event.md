# onEvent

Run some code when a player connects or disconnects.

```sig
controller.player2.onEvent(ControllerEvent.Connected, function () {})
```

## Parameters

* **event**: the connection action to wait for. The connection actions (events) are:
> * ``connected``: player is connected
> * ``disconnected``: button is released from being pressed
* **handler**: the code you want to run when a player connect event happens

## Example #example

Make the yellow box sprite give a message when Player 2 connects.

```blocks
let yellowBox = sprites.create(img`
e e e e e e
e 1 1 1 1 e
e 1 6 6 1 e
e 1 6 6 1 e
e 1 1 1 1 e
e e e e e e
`)
controller.player2.onEvent(ControllerEvent.Connected, function () {
    yellowBox.say("Player2 is on!")
})
```

## See also #seealso

[is pressed](/reference/controller/on-button-event)

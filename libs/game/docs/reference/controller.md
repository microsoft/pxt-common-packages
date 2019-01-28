# Controller

Respond to game controller buttons.

```cards
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {})
controller.A.isPressed()
controller.moveSprite(null, 0, 0)
controller.dx(100)
controller.dy(100)
```

## Multiplayer

```cards
controller.player2.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {})
controller.player2.moveSprite(null)
controller.player2.onEvent(ControllerEvent.Connected, function () {})
controller.player2.isPressed(ControllerButton.A)
controller.player2.dx()
controller.player2.dy()
```

## See also

[on event](/reference/controller/button/on-event),
[is pressed](/reference/controller/button/is-pressed),
[on button event](/reference/controller/button/on-buttonevent),
[move sprite](/reference/controller/move-sprite),
[dx](/reference/controller/dx),
[dy](/reference/controller/dy)

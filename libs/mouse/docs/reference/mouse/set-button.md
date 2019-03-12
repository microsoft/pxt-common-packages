# set Button

Emulate a mouse button down or button up.

```sig
mouse.setButton(MouseButton.Right, false)
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate mouse actions. This function doesn't work in the simulator.

## ~

## Parameters

* **button**: the button selected to simulate a press down or release up for. The buttons are ``left``, ``middle``, and ``right``.
* **down**: a [boolean](/types/boolean) that is either ``true`` for a button down or ``false`` for a button up.

## Example #example

Simulate left and right mouse button clicks with the buttons on the board.

```blocks
input.buttonA.onEvent(ButtonEvent.Down, function () {
    mouse.setButton(MouseButton.Left, true)
})
input.buttonA.onEvent(ButtonEvent.Up, function () {
    mouse.setButton(MouseButton.Right, false)
})
input.buttonB.onEvent(ButtonEvent.Down, function () {
    mouse.setButton(MouseButton.Right, true)
})
input.buttonB.onEvent(ButtonEvent.Up, function () {
    mouse.setButton(MouseButton.Right, false)
})
```

## See also #seealso

[move](/reference/mouse/move), [turn wheel](/reference/mouse/turn-wheel)

```package
mouse
```
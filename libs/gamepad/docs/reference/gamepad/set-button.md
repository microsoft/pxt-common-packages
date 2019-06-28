# set Button

Set the button state to up (true) or down (false). 

```sig
gamepad.setButton(0, false)
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate gamepad actions. This function doesn't work in the simulator.

## ~

## Parameters

* **index**: a [number](/types/number) that is it index of the emulated gamepad, `0` or `1`.
* **state**: a [boolean](types/boolean) value that is `true` to simulate the gamepad button state for up and `false` for down.

## Example #example

Simulate gamepad button down presses with the buttons on the board.

```blocks
input.buttonA.onEvent(ButtonEvent.Down, function () {
    gamepad.setButton(GamepadButton.A, true)
})
input.buttonB.onEvent(ButtonEvent.Down, function () {
    gamepad.setButton(GamepadButton.B, true)
})
input.buttonsAB.onEvent(ButtonEvent.Down, function () {
    gamepad.setButton(GamepadButton.Select, true)
})
```

## Trying it out

You can use [HTML5 Gamepad](http://html5gamepad.com/) in your browser to test your code.

## See also #seealso

[set throttle](/reference/gamepad/set-tjhrottle),
[move](/reference/gamepad/move)

```package
gamepad
```

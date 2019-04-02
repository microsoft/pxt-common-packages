# move

Emulate a joystick or gamepad move in the X and Y directions.

```sig
gamepad.move(0, 0, 0)
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate gamepad actions. This function doesn't work in the simulator.

## ~

## Parameters

* **index**: a [number](/types/number) that is it index of the emulated gamepad, `0` or `1`.
* **x**: a motion vector [number](/types/number) in the horizontal direction to simulate the joystick vertical position. Use a negative number to simulate moving left and an positive number to simulate moving right.
* **y**: a motion vector [number](/types/number) in the vertical direction to simulate the joystick vertical position. Use a negative number to simulate moving up and an positive number to simulate moving down.

## Example #example

Simulate a joystick position when the board is tilted left or down.

```blocks
input.onGesture(Gesture.TiltLeft, function () {
    gamepad.move(0, -20, 0)
})
input.onGesture(Gesture.TiltDown, function () {
    gamepad.move(0, 0, 5)
})
```

## Trying it out

You can use [HTML5 Gamepad](http://html5gamepad.com/) in your browser to test your code.

## See also #seealso

[set button](/reference/gamepad/set-button),
[set throttle](/reference/gamepad/set-throttle)

```package
gamepad
```
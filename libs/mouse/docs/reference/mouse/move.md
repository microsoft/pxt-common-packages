# move

Emulate a mouse move in the X and Y directions.

```sig
mouse.move(0, 0);
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate mouse actions. This function doesn't work in the simulator.

## ~

## Parameters

* **x**: a distance [number](/types/number) in the horizontal direction to move the mouse cursor. Use a negative number to simulate moving left and an positive number to simulate moving right.
* **y**: a distance [number](/types/number) in the vertical direction to move the mouse cursor. Use a negative number to simulate moving up and an positive number to simulate moving down.

## Example #example

Send mouse moves to a computer that is connected to the @boardname@. A mouse move of `10` to the left is emulated when the board is tilted left and a mouse move of `10` is emulated when the board is tilted right.

```blocks
input.onGesture(Gesture.TiltLeft, function () {
    mouse.move(-10, 0)
})
input.onGesture(Gesture.TiltLeft, function () {
    mouse.move(10, 0)
})
```

## See also #seealso

[set button](/reference/mouse/set-button), [turn wheel](/reference/mouse/turn-wheel)

```package
mouse
```
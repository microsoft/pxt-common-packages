# turn Wheel

Emulate a turn of a mouse wheel in either direction.

```sig
mouse.turnWheel(0);
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate mouse actions. This function doesn't work in the simulator.

## ~

## Parameters

* **w**: a [number](/types/number) of wheel turn increments to emulate. Use a negative number to simulate turning forward and an positive number to simulate turning backward.

## Example #example

Send mouse wheel turns to a computer that is connected to the @boardname@. A mouse wheel turn forward is emulated when the board is tilted up and a mouse wheel turn backward is emulated when the board is tilted down.

```blocks
input.onGesture(Gesture.TiltUp, function () {
    mouse.turnWheel(-5)
})
input.onGesture(Gesture.TiltDown, function () {
    mouse.turnWheel(5)
})
```

## See also #seealso

[set button](/reference/mouse/set-button), [move](/reference/mouse/move)

```package
mouse
```
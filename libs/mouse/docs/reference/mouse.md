# Mouse

Emulate mouse actions using a USB connection.

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate a mouse. This function doesn't work in the simulator.

## ~

```cards
mouse.setButton(MouseButton.Left, true);
mouse.move(0, 0);
mouse.turnWheel(0);
```

## See also

[move](/reference/mouse/move), [set button](/reference/mouse/set-button), [turn wheel](/reference/mouse/turn-wheel)

```package
mouse
```
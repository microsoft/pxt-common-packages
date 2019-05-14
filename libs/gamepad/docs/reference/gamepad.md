# Gamepad

Emulate gamepad actions using a USB connection.

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate a gamepad. This function doesn't work in the simulator.

## ~

```cards
gamepad.setButton(GamepadButton.B, false)
gamepad.move(0, 0, 0)
gamepad.setThrottle(0, 0)
```

## See also

[move](/reference/gamepad/move), [set button](/reference/gamepad/set-button), [set throttle](/reference/gamepad/set-throttle)

```package
gamepad
```
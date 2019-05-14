# Keyboard

Emulate typing with a keyboard using a USB connection.

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate a keyboard. This function doesn't work in the simulator.

## ~

```cards
keyboard.type("")
keyboard.key("", KeyboardKeyEvent.Press)
keyboard.mediaKey(KeyboardMediaKey.Mute, KeyboardKeyEvent.Press)
keyboard.functionKey(KeyboardFunctionKey.F1Key, KeyboardKeyEvent.Press)
```

## See also

[type](/reference/keyboard/type), [key](/reference/keyboard/key), [media key](/reference/keyboard/media-key), [function key](/reference/keyboard/function-key)

```package
keyboard
```
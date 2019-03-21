# type

Emulate typing text characters on a keyboard.

```sig
keyboard.type("")
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate keyboard actions. This function doesn't work in the simulator.

## ~

## Parameters

* **text**: a [string](/types/string) of text characters to send as simulated keystrokes.

## Example #example

Emulate typing a command to open this page in the web browser.

```blocks
keyboard.mediaKey(KeyboardMediaKey.WebHome, KeyboardKeyEvent.Press)
keyboard.type("@homeurl@reference/keyboard/type")
```

## See also #seealso

[key](/reference/keyboard/key), [media key](/reference/keyboard/media-key), [function key](/reference/keyboard/function-key)

```package
keyboard
```
# key

Emulate a key press of a single text key on a keyboard.

```sig
keyboard.key("", KeyboardKeyEvent.Press)
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate keyboard actions. This function doesn't work in the simulator.

## ~

The text key character is placed in a string. If the key string contatins more than one character, only the first character is used as the keystroke.

## Parameters

* **key**: a [string](/types/string) that is one text character of the key press to simulate.
* **event**: the key press event to simulate. These are:
>* `press`: simulate a text key press down and then release up
>* `down`: simulate a text key press down
>* `up`: simulate a text key release up

## Example #example

Emulate pressing the "A" key down for `2` seconds and then releasing it.

```blocks
keyboard.key("A", KeyboardKeyEvent.Down)
pause(2000)
keyboard.key("A", KeyboardKeyEvent.Up)
```

## See also #seealso

[type](/reference/keyboard/type), [media key](/reference/keyboard/media-key), [function key](/reference/keyboard/function-key)

```package
keyboard
```
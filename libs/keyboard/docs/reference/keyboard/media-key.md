# media Key

Emulate a press of a media key on a keyboard.

```sig
keyboard.mediaKey(KeyboardMediaKey.Mute, KeyboardKeyEvent.Press)
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate keyboard actions. This function doesn't work in the simulator.

## ~

Media keys are special keys found on many keyboards to do special actions with applications. Some examples are to turn sound volume up or open a web search window.

## Parameters

* **key**: a keyboard media key. The key choices are in the key list of the block or part or the ``KeyboardMediaKey`` enumeration.
* **event**: the key press event to simulate. These are:
>* `press`: simulate a media key press down and then release up
>* `down`: simulate a media key press down
>* `up`: simulate a media key release up

## Example #example

Emulate typing a command to open this page in the web browser.

```blocks
keyboard.mediaKey(KeyboardMediaKey.WebHome, KeyboardKeyEvent.Press)
keyboard.type("@homeurl@reference/keyboard/media-key")
```

## See also #seealso

[type](/reference/keyboard/type), [key](/reference/keyboard/key), [function key](/reference/keyboard/function-key)

```package
keyboard
```
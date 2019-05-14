# function Key

Emulate a press of a function key on a keyboard.

```sig
keyboard.functionKey(KeyboardFunctionKey.F1Key, KeyboardKeyEvent.Press)
```

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate keyboard actions. This function doesn't work in the simulator.

## ~

Function keys are keys for user input to an application that isn't text. These keys tell an application to do things like scroll or close the window.

## Parameters

* **key**: a keyboard function key. The key choices are in the key list of the block or part or the ``KeyboardFunctionKey`` enumeration.
* **event**: the key press event to simulate. These are:
>* `press`: simulate a function key press down and then release up
>* `down`: simulate a function key press down
>* `up`: simulate a function key release up

## Example #example

Emulate pressing the `page down` key 4 times to scroll through a list of news articles.

```blocks
keyboard.mediaKey(KeyboardMediaKey.WebSearch, KeyboardKeyEvent.Press)
keyboard.type("news")
pause(2000)
for (let i = 0; i < 4; i++) {
    pause(4000)
    keyboard.functionKey(KeyboardFunctionKey.PageDown, KeyboardKeyEvent.Press)
}
```

## See also #seealso

[type](/reference/keyboard/type), [key](/reference/keyboard/key), [media key](/reference/keyboard/media-key)

```package
keyboard
```
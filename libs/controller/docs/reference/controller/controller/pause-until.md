# pause Until

Causes your program to wait until an event for a key happens.

```sig
controller.anyButton.pauseUntil(KeyEvent.Pressed)
```

## Parameters

* **event**: the key action to wait for. The key actions (events) are:
> * ``pressed``: key was pressed
> * ``released``: button is released from being pressed

## Example #example

Wait to move a yellow square to the upper left corner of the screen until the ``B`` key is pressed.

```blocks
let square = sprites.create(img`
e e e e e e 
e e e e e e 
e e e e e e 
e e e e e e 
e e e e e e 
e e e e e e 
`)
controller.B.pauseUntil(KeyEvent.Pressed)
square.x = 3
square.y = 3
```

## See also #seealso

[on event](/reference/keys/key/on-event)
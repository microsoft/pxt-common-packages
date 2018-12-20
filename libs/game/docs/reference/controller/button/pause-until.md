# pause Until

Causes your program to wait until an event for a button happens.

```sig
controller.anyButton.pauseUntil(ControllerButtonEvent.Pressed)
```

## Parameters

* **event**: the button action to wait for. The button actions (events) are:
> * ``pressed``: button was pressed
> * ``released``: button is released from being pressed

## Example #example

Wait to move a yellow square to the upper left corner of the screen until the ``B`` button is pressed.

```blocks
let square = sprites.create(img`
e e e e e e 
e e e e e e 
e e e e e e 
e e e e e e 
e e e e e e 
e e e e e e 
`)
controller.B.pauseUntil(ControllerButtonEvent.Pressed)
square.x = 3
square.y = 3
```

## See also #seealso

[on event](/reference/controller/button/on-event)
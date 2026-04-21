# click

Emulate a mouse button click.

```sig
mouse.click(MouseButton.Left)
```

A mouse button click is a rapid sequence of button `on` and `off` events. Using **click()** will simulate the two as one action.

## ~ hint

The @boardname@ needs a connection to a computer or other host device with a USB cable in order to emulate mouse actions. This function doesn't work in the simulator.

## ~

## Parameters

* **button**: the identifier of the button to emulate a mouse click for: `left`, `right`, or `middle`.

## Example #example

Send a mouse button right-click to a computer that is connected to the @boardname@.

```blocks
input.buttonB.onEvent(ButtonEvent.Click, function() {
    mouse.click(MouseButton.Right)
})
```

## See also #seealso

[set button](/reference/mouse/set-button),
[turn wheel](/reference/mouse/turn-wheel)

```package
mouse
```